import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
import { uploadRateLimit } from '../../../lib/rate-limit';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, formidable will handle it
  },
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current session
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        error: 'Cloudinary not configured',
        message: 'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file'
      });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const avatarFile = files.avatar?.[0];

    if (!avatarFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    if (!avatarFile.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Get current user to check for existing avatar
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { avatar: true, id: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the old avatar from Cloudinary if it exists
    // This ensures we don't accumulate unused images
    if (currentUser.avatar?.includes('cloudinary')) {
      try {
        const urlParts = currentUser.avatar.split('/');
        const publicIdWithExt = urlParts.slice(7).join('/'); // Get path after /upload/
        const publicId = publicIdWithExt.split('.')[0]; // Remove extension
        await cloudinary.uploader.destroy(publicId);
        console.log('Successfully deleted old avatar:', publicId);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        // Continue even if deletion fails - new upload is more important
      }
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(avatarFile.filepath, {
      folder: 'mistral/avatars',
      public_id: `user_${currentUser.id}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
      overwrite: true,
    });

    // Update user avatar in database
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        avatar: result.secure_url,
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    // Clean up temporary file
    fs.unlinkSync(avatarFile.filepath);

    return res.status(200).json({
      success: true,
      avatar: updatedUser.avatar,
      message: 'Avatar uploaded successfully',
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Apply upload rate limiting: 5 uploads per hour
export default uploadRateLimit(handler);
