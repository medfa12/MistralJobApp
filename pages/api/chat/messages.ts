import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

  if (req.method === 'GET') {
    try {
      const { conversationId } = req.query;

      if (!conversationId || typeof conversationId !== 'string') {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }

      const conversation = await db.chatConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const messages = await db.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
          attachments: true,
        },
      });

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    try {
      const { conversationId, role, content, attachments, artifact, toolCall, inspectedCodeAttachment } = req.body;

      if (!conversationId || !role || !content) {
        return res.status(400).json({
          error: 'Conversation ID, role, and content are required',
        });
      }

      const conversation = await db.chatConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const message = await db.chatMessage.create({
        data: {
          conversationId,
          role,
          content,
          ...(artifact && { artifact }),
          ...(toolCall && { toolCall }),
          ...(inspectedCodeAttachment && { inspectedCodeAttachment }),
          ...(attachments && attachments.length > 0 && {
            attachments: {
              create: attachments.map((att: any) => ({
                type: att.type,
                fileName: att.fileName,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
                cloudinaryPublicId: att.cloudinaryPublicId,
                cloudinaryUrl: att.cloudinaryUrl,
              })),
            },
          }),
        },
        include: {
          attachments: true,
        },
      });

      await db.chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: 'Failed to create message' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
