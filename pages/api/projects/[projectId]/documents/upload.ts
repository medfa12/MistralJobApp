import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
import FileType from 'file-type';
import { DOCUMENT_PROCESSING, API } from '@/lib/constants';
import { apiError, apiSuccess } from '@/lib/api-helpers';
import { logger, logDocumentProcessing } from '@/lib/logger';
import { cache, getCacheKey } from '@/lib/cache';
import { extractTextFromDocument, chunkText, estimateTokenCount } from '@/lib/document-processing';
import { createEmbeddings } from '@/lib/embedding';
import { checkRateLimit } from '@/lib/rate-limiter';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return apiError(res, 405, 'Method not allowed');
  }

  try {
    if (!checkRateLimit(req, res, API.RATE_LIMIT_UPLOAD, API.RATE_LIMIT_WINDOW_MS)) {
      return apiError(res, 429, 'Too many requests. Please try again later.');
    }

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
    });

    if (!project) {
      return apiError(res, 404, 'Project not found');
    }

    const form = formidable({
      maxFileSize: DOCUMENT_PROCESSING.MAX_FILE_SIZE,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return apiError(res, 400, 'No file uploaded');
    }

    const fileName = file.originalFilename || 'document';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (!DOCUMENT_PROCESSING.ALLOWED_EXTENSIONS.includes(extension as any)) {
      return apiError(res, 400, 
        `Unsupported file type: ${extension}. Allowed: ${DOCUMENT_PROCESSING.ALLOWED_EXTENSIONS.join(', ')}`
      );
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    const detectedType = await FileType.fromBuffer(fileBuffer);

    if (detectedType && !DOCUMENT_PROCESSING.ALLOWED_MIME_TYPES.includes(detectedType.mime as any)) {
      fs.unlinkSync(file.filepath);
      return apiError(res, 400, 'File content does not match extension');
    }

    const cloudinaryResult = await cloudinary.uploader.upload(file.filepath, {
      folder: `mistral/projects/${projectId}/documents`,
      resource_type: 'raw',
      public_id: `${Date.now()}_${fileName}`,
      type: 'authenticated',
    });

    logger.info('Document uploaded to Cloudinary', {
      publicId: cloudinaryResult.public_id,
      secureUrl: cloudinaryResult.secure_url,
      url: cloudinaryResult.url,
    });

    const document = await prisma.projectDocument.create({
      data: {
        projectId: project.id,
        name: fileName,
        extension,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        processingStatus: 'pending',
      },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        documentCount: { increment: 1 },
        totalSize: { increment: file.size },
      },
    });

    const cacheKey = getCacheKey('chunks', projectId);
    cache.delete(cacheKey);

    logDocumentProcessing('uploaded', document.id, {
      projectId,
      userId: user.id,
      fileName,
      size: file.size,
    });

    const documentBuffer = Buffer.from(fileBuffer);
    fs.unlinkSync(file.filepath);

    const userApiKey = req.headers['x-mistral-api-key'] as string || process.env.MISTRAL_API_KEY;

    setImmediate(async () => {
      try {
        await prisma.projectDocument.update({
          where: { id: document.id },
          data: { processingStatus: 'processing' },
        });

        logger.info('Starting document processing', {
          documentId: document.id,
          extension: document.extension,
        });

        const { text, pageCount } = await extractTextFromDocument(documentBuffer, document.extension);

        if (!text || text.trim().length === 0) {
          throw new Error('No content found in document');
        }

        const chunks = chunkText(text);

        if (chunks.length === 0) {
          throw new Error('No valid chunks created from document');
        }

        const embeddings = await createEmbeddings(chunks, userApiKey!);

        const chunkDocuments = chunks.map((content, index) => ({
          projectId: document.projectId,
          documentId: document.id,
          chunkIndex: index,
          content,
          embedding: embeddings[index],
          tokenCount: estimateTokenCount(content),
          metadata: {},
        }));

        const BATCH_INSERT_SIZE = 100;
        for (let i = 0; i < chunkDocuments.length; i += BATCH_INSERT_SIZE) {
          const batch = chunkDocuments.slice(i, i + BATCH_INSERT_SIZE);
          await prisma.documentChunk.createMany({
            data: batch,
          });
        }

        await prisma.projectDocument.update({
          where: { id: document.id },
          data: {
            processingStatus: 'completed',
            chunkCount: chunks.length,
            numberOfPages: pageCount,
            processedAt: new Date(),
          },
        });

        cache.delete(cacheKey);

        logger.info('Document processed successfully', {
          documentId: document.id,
          chunkCount: chunks.length,
          pageCount,
        });
      } catch (error) {
        logger.error('Error processing document in background', {
          documentId: document.id,
          error: error instanceof Error ? error.message : String(error),
        });

        await prisma.documentChunk.deleteMany({
          where: { documentId: document.id },
        }).catch(() => {});

        await prisma.projectDocument.update({
          where: { id: document.id },
          data: {
            processingStatus: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        }).catch(() => {});
      }
    });

    return apiSuccess(res, {
      document: {
        id: document.id,
        name: document.name,
        extension: document.extension,
        size: document.size,
        cloudinaryUrl: document.cloudinaryUrl,
        processingStatus: document.processingStatus,
        uploadedAt: document.uploadedAt,
      },
    }, 201);
  } catch (error) {
    logger.error('Error uploading document', { error });
    return apiError(res, 500, 'Internal server error', 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
