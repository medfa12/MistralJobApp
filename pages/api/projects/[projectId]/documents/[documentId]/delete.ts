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

    const { projectId, documentId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      return apiError(res, 400, 'Project ID is required');
    }

    if (!documentId || typeof documentId !== 'string') {
      return apiError(res, 400, 'Document ID is required');
    }

    const document = await prisma.projectDocument.findFirst({
      where: {
        id: documentId,
        projectId: projectId,
        project: {
          userId: user.id,
        },
      },
    });

    if (!document) {
      return apiError(res, 404, 'Document not found or access denied');
    }

    await prisma.documentChunk.deleteMany({
      where: { documentId: document.id },
    });

    await prisma.projectDocument.update({
      where: { id: document.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        documentCount: { decrement: 1 },
        totalSize: { decrement: document.size },
      },
    });

    try {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
        resource_type: 'raw',
        type: 'authenticated',
        invalidate: true,
      });
    } catch (cloudinaryError) {
      logger.error('Failed to delete from Cloudinary', {
        documentId: document.id,
        cloudinaryPublicId: document.cloudinaryPublicId,
        error: cloudinaryError,
      });
    }

    const cacheKey = getCacheKey('chunks', projectId);
    cache.delete(cacheKey);

    logger.info('Document deleted', {
      documentId: document.id,
      projectId,
      userId: user.id,
    });

    return apiSuccess(res, {
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting document', { error });
    return apiError(res, 500, 'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
