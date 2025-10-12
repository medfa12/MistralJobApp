import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiError } from '@/lib/api-helpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
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

    const { name, description, emoji } = req.body;

    if (!name || !name.trim()) {
      return apiError(res, 400, 'Project name is required');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        emoji: emoji?.trim() || null,
      },
    });

    return res.status(200).json({
      success: true,
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        emoji: updatedProject.emoji,
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return apiError(res, 500, 'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
