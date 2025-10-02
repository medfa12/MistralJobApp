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

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }

  const conversation = await db.chatConversation.findFirst({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (req.method === 'PATCH') {
    try {
      const { title } = req.body;

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const updatedConversation = await db.chatConversation.update({
        where: { id: id },
        data: { title: title.trim() },
      });

      return res.status(200).json(updatedConversation);
    } catch (error) {
      console.error('Error updating conversation:', error);
      return res.status(500).json({ error: 'Failed to update conversation' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const messages = await db.chatMessage.findMany({
        where: { conversationId: id },
        include: { attachments: true },
      });

      const attachmentPromises = messages.flatMap(msg =>
        msg.attachments.map(att =>
          cloudinary.uploader.destroy(att.cloudinaryPublicId, {
            resource_type: att.type === 'image' ? 'image' : 'raw',
          }).catch(err => console.error('Failed to delete from Cloudinary:', err))
        )
      );

      await Promise.allSettled(attachmentPromises);

      await db.chatConversation.delete({
        where: { id: id },
      });

      return res.status(200).json({ message: 'Conversation deleted' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return res.status(500).json({ error: 'Failed to delete conversation' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

