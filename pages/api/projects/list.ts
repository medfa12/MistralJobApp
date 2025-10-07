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

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        documents: {
          select: {
            id: true,
            name: true,
            extension: true,
            size: true,
            processingStatus: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        emoji: project.emoji,
        mistralLibraryId: project.mistralLibraryId,
        generatedName: project.generatedName,
        generatedDescription: project.generatedDescription,
        documentCount: project.documentCount,
        totalSize: project.totalSize,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        documents: project.documents,
      })),
    });
  } catch (error) {
    console.error('Error listing projects:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

