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
    try {
      const { limit } = req.query;
      const take = limit ? parseInt(limit as string) : undefined;

      const conversations = await db.chatConversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        ...(take && { take }),
      });

      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  } else if (req.method === 'POST') {
    // Create a new conversation
    try {
      const { title, model } = req.body;

      if (!title || !model) {
        return res.status(400).json({ error: 'Title and model are required' });
      }

      const conversation = await db.chatConversation.create({
        data: {
          userId: user.id,
          title,
          model,
        },
      });

      return res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({ error: 'Failed to create conversation' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a conversation
    try {
      const { conversationId } = req.body;

      if (!conversationId) {
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

      await db.chatConversation.delete({
        where: { id: conversationId },
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

