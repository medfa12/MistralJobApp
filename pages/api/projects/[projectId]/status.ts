import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiError } from '@/lib/api-helpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return apiError(res, 405, 'Method not allowed');
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return apiError(res, 401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return apiError(res, 404, 'User not found');
    }

    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      return apiError(res, 400, 'Project ID is required');
    }

    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: user.id,
      },
      include: {
        documents: {
          where: { isActive: true },
          select: {
            id: true,
            processingStatus: true,
          },
        },
      },
    });

    if (!project) {
      return apiError(res, 404, 'Project not found');
    }

    const processingCount = project.documents.filter(
      doc => doc.processingStatus === 'processing' || doc.processingStatus === 'pending'
    ).length;

    return res.status(200).json({
      success: true,
      hasProcessing: processingCount > 0,
      processingCount,
      documentStatuses: project.documents.map(doc => ({
        id: doc.id,
        status: doc.processingStatus,
      })),
    });
  } catch (error) {
    console.error('Error getting project status:', error);
    return apiError(res, 500, 'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

