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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return apiError(res, 404, 'Project not found or access denied');
    }

    const conversations = await prisma.projectConversation.findMany({
      where: {
        projectId: projectId,
        userId: user.id,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error listing conversations:', error);
    return apiError(res, 500, 'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

