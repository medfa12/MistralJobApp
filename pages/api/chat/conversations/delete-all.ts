import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'DELETE') {
    try {
      // Get all conversations for the user
      const conversations = await db.chatConversation.findMany({
        where: { userId: user.id },
        include: {
          messages: {
            include: {
              attachments: true,
            },
          },
        },
      });

      if (conversations.length === 0) {
        return res.status(200).json({ 
          message: 'No conversations to delete',
          deletedCount: 0 
        });
      }

      // Collect all attachments from all conversations
      const allAttachments = conversations.flatMap(conv =>
        conv.messages.flatMap(msg => msg.attachments)
      );

      // Delete all attachments from Cloudinary
      const attachmentPromises = allAttachments.map(att =>
        cloudinary.uploader.destroy(att.cloudinaryPublicId, {
          resource_type: att.type === 'image' ? 'image' : 'raw',
        }).catch(err => console.error('Failed to delete from Cloudinary:', err))
      );

      await Promise.allSettled(attachmentPromises);

      // Delete all conversations (cascade will handle messages, artifacts, etc.)
      const deleteResult = await db.chatConversation.deleteMany({
        where: { userId: user.id },
      });

      return res.status(200).json({ 
        message: 'All conversations deleted successfully',
        deletedCount: deleteResult.count 
      });
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      return res.status(500).json({ error: 'Failed to delete all conversations' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

