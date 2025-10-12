import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: user.id,
      },
      include: {
        documents: {
          where: { isActive: true },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        emoji: project.emoji,
        documentCount: project.documents.length,
        totalSize: project.documents.reduce((sum, d) => sum + d.size, 0),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        documents: project.documents,
      },
    });
  } catch (error) {
    console.error('Error getting project:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
