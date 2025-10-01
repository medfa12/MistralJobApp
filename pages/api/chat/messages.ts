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

  // Get user from database
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    // Get all messages for a conversation
    try {
      const { conversationId } = req.query;

      if (!conversationId || typeof conversationId !== 'string') {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }

      // Verify the conversation belongs to the user
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
      });

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    // Add a message to a conversation
    try {
      const { conversationId, role, content } = req.body;

      if (!conversationId || !role || !content) {
        return res.status(400).json({
          error: 'Conversation ID, role, and content are required',
        });
      }

      // Verify the conversation belongs to the user
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
        },
      });

      // Update conversation's updatedAt timestamp
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

