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
      const { limit, offset, search } = req.query;
      const take = limit ? parseInt(limit as string) : 20;
      const skip = offset ? parseInt(offset as string) : 0;

      const where: any = { userId: user.id };

      if (search && typeof search === 'string') {
        where.title = {
          contains: search,
          mode: 'insensitive'
        };
      }

      const [conversations, total] = await Promise.all([
        db.chatConversation.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          take,
          skip,
          include: {
            _count: {
              select: {
                messages: true,
                artifacts: true,
              }
            }
          }
        }),
        db.chatConversation.count({ where })
      ]);

      return res.status(200).json({
        conversations,
        pagination: {
          total,
          limit: take,
          offset: skip,
          hasMore: skip + take < total,
          page: Math.floor(skip / take) + 1,
          totalPages: Math.ceil(total / take),
        }
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  } else if (req.method === 'POST') {
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
    try {
      const { conversationId } = req.body;

      if (!conversationId) {
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
