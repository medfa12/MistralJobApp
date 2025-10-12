import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';
import { apiError, apiSuccess } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';
import { cache, getCacheKey } from '@/lib/cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
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
      include: {
        documents: {
          select: {
            cloudinaryPublicId: true,
          },
        },
      },
    });

    if (!project) {
      return apiError(res, 404, 'Project not found or access denied');
    }

    await prisma.documentChunk.deleteMany({
      where: { projectId: projectId },
    });

    await prisma.projectConversationMessage.deleteMany({
      where: {
        conversation: {
          projectId: projectId,
        },
      },
    });

    await prisma.projectConversation.deleteMany({
      where: { projectId: projectId },
    });

    await prisma.projectDocument.deleteMany({
      where: { projectId: projectId },
    });

    for (const doc of project.documents) {
      try {
        await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
          resource_type: 'raw',
        });
      } catch (cloudinaryError) {
        logger.error('Failed to delete document from Cloudinary', {
          publicId: doc.cloudinaryPublicId,
          error: cloudinaryError,
        });
      }
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    const cacheKey = getCacheKey('chunks', projectId);
    cache.delete(cacheKey);

    logger.info('Project deleted', {
      projectId,
      userId: user.id,
      documentCount: project.documents.length,
    });

    return apiSuccess(res, {
      message: 'Project deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting project', { error });
    return apiError(res, 500, 'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
