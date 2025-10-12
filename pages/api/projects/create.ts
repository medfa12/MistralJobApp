import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, description, emoji } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (name.trim().length > 200) {
      return res.status(400).json({ error: 'Project name is too long (max 200 characters)' });
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        emoji: emoji?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        emoji: project.emoji,
        documentCount: project.documentCount,
        totalSize: project.totalSize,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
