import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        error: 'Cloudinary not configured',
        message: 'Please add CLOUDINARY credentials to your .env file'
      });
    }

    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];
    const attachmentType = fields.type?.[0];

    if (!file || !attachmentType) {
      return res.status(400).json({ error: 'File and type are required' });
    }

    let folder = 'mistral/attachments';
    let resourceType: 'image' | 'raw' = 'raw';

    if (attachmentType === 'image') {
      if (!file.mimetype?.startsWith('image/')) {
        return res.status(400).json({ error: 'Invalid image file' });
      }
      folder = 'mistral/attachments/images';
      resourceType = 'image';
    } else if (attachmentType === 'document') {
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF documents are supported' });
      }
      folder = 'mistral/attachments/documents';
    }

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder,
      resource_type: resourceType,
      public_id: `${Date.now()}_${file.originalFilename?.replace(/[^a-zA-Z0-9]/g, '_')}`,
    });

    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileName: file.originalFilename || 'file',
      fileSize: file.size,
      mimeType: file.mimetype,
      type: attachmentType,
    });

  } catch (error) {
    console.error('Error uploading attachment:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
