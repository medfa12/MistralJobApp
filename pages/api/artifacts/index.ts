import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiRateLimit } from '@/lib/rate-limit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    try {
      const { conversationId, limit, offset } = req.query;
      const take = limit ? parseInt(limit as string) : 50;
      const skip = offset ? parseInt(offset as string) : 0;

      const where: any = { userId: user.id };
      if (conversationId) {
        where.conversationId = conversationId as string;
      }

      const artifacts = await db.artifact.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          identifier: true,
          type: true,
          title: true,
          code: true,
          language: true,
          versions: true,
          currentVersion: true,
          createdAt: true,
          updatedAt: true,
          conversationId: true,
        },
      });

      const total = await db.artifact.count({ where });

      return res.status(200).json({
        artifacts,
        pagination: {
          total,
          limit: take,
          offset: skip,
          hasMore: skip + take < total,
        },
      });
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      return res.status(500).json({ error: 'Failed to fetch artifacts' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        conversationId,
        identifier,
        type,
        title,
        code,
        language,
        versions,
        currentVersion,
      } = req.body;

      if (!identifier || !type || !title || !code) {
        return res.status(400).json({
          error: 'Identifier, type, title, and code are required',
        });
      }

      // Verify conversation belongs to user if provided
      if (conversationId) {
        const conversation = await db.chatConversation.findFirst({
          where: {
            id: conversationId,
            userId: user.id,
          },
        });

        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
      }

      const artifact = await db.artifact.create({
        data: {
          userId: user.id,
          conversationId: conversationId || null,
          identifier,
          type,
          title,
          code,
          language: language || null,
          versions: versions || null,
          currentVersion: currentVersion || null,
        },
      });

      return res.status(201).json(artifact);
    } catch (error) {
      console.error('Error creating artifact:', error);
      return res.status(500).json({ error: 'Failed to create artifact' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Apply rate limiting: 60 requests per minute
export default apiRateLimit(handler);

