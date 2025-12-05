import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getMistralApiKey } from '@/lib/mistral';
import { extractTextFromDocument, chunkText, estimateTokenCount } from '@/lib/document-processing';
import { createEmbeddings } from '@/lib/embedding';
import { apiError, apiSuccess } from '@/lib/api-helpers';
import { logger, logDocumentProcessing } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';
import { cache, getCacheKey } from '@/lib/cache';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BATCH_INSERT_SIZE = 100;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT = 30000;

async function fetchDocumentBuffer(cloudinaryUrl: string, cloudinaryPublicId: string): Promise<Buffer> {
  const https = require('https');
  const http = require('http');

  logger.debug('Attempting to download from Cloudinary', {
    cloudinaryPublicId,
    cloudinaryUrl,
  });

  const fetchWithRedirects = (url: string, redirectCount: number = 0): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
      if (redirectCount > MAX_REDIRECTS) {
        reject(new Error(`Too many redirects (max: ${MAX_REDIRECTS})`));
        return;
      }

      const protocol = url.startsWith('https') ? https : http;

      const request = protocol.get(url, { timeout: REQUEST_TIMEOUT }, (response: any) => {
        if (response.statusCode === 200) {
          const chunks: ArrayBuffer[] = [];
          let totalLength = 0;

          response.on('data', (chunk: ArrayBuffer) => {
            chunks.push(chunk);
            totalLength += chunk.byteLength;
          });

          response.on('end', () => {
            const result = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              result.set(new Uint8Array(chunk), offset);
              offset += chunk.byteLength;
            }
            resolve(Buffer.from(result));
          });

          response.on('error', (error: Error) => {
            reject(error);
          });
        } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            reject(new Error('Redirect response missing location header'));
            return;
          }

          logger.info('Following redirect', { redirectUrl, redirectCount: redirectCount + 1 });
          fetchWithRedirects(redirectUrl, redirectCount + 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`Failed to fetch: ${response.statusCode} ${response.statusMessage}`));
        }
      });

      request.on('error', (error: Error) => {
        reject(error);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timed out'));
      });
    });
  };

  try {
    return await fetchWithRedirects(cloudinaryUrl, 0);
  } catch (error) {
    logger.error('Failed to fetch document from Cloudinary', {
      cloudinaryUrl,
      cloudinaryPublicId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return apiError(res, 405, 'Method not allowed');
  }

  if (!checkRateLimit(req, res, 10, 60000)) {
    return apiError(res, 429, 'Too many requests. Please try again later.');
  }

  const { projectId, documentId } = req.query;

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return apiError(res, 401, 'Unauthorized');
    }

    const document = await prisma.projectDocument.findFirst({
      where: { 
        id: documentId as string,
        projectId: projectId as string,
        project: {
          user: {
            email: session.user.email,
          },
        },
      },
    });

    if (!document) {
      return apiError(res, 404, 'Document not found');
    }

    logDocumentProcessing('processing_started', document.id, {
      projectId: projectId as string,
    });

    await prisma.projectDocument.update({
      where: { id: document.id },
      data: { processingStatus: 'processing' },
    });

    const apiKey = getMistralApiKey();
    if (!apiKey) {
      throw new Error('Mistral API key not configured on server');
    }

    logger.debug('Fetching document from Cloudinary', {
      cloudinaryUrl: document.cloudinaryUrl,
      cloudinaryPublicId: document.cloudinaryPublicId,
      documentId: document.id,
    });

    const fileBuffer = await fetchDocumentBuffer(document.cloudinaryUrl, document.cloudinaryPublicId);

    const { text, pageCount } = await extractTextFromDocument(
      fileBuffer, 
      document.extension
    );

    if (!text || text.trim().length === 0) {
      throw new Error('No content found in document');
    }

    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error('No valid chunks created from document');
    }

    logDocumentProcessing('creating_embeddings', document.id, {
      chunkCount: chunks.length,
    });

    const embeddings = await createEmbeddings(chunks, apiKey);

    const chunkDocuments = chunks.map((content, index) => ({
      projectId: document.projectId,
      documentId: document.id,
      chunkIndex: index,
      content,
      embedding: embeddings[index],
      tokenCount: estimateTokenCount(content),
      metadata: {},
    }));

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

    const cacheKey = getCacheKey('chunks', projectId as string);
    cache.delete(cacheKey);

    logDocumentProcessing('processing_completed', document.id, {
      chunkCount: chunks.length,
      pageCount,
    });

    return apiSuccess(res, {
      message: 'Document processed successfully',
      chunkCount: chunks.length,
      pageCount,
    });
  } catch (error) {
    logger.error('Error processing document', {
      documentId: documentId as string,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    if (documentId) {
      await prisma.documentChunk.deleteMany({
        where: { documentId: documentId as string },
      }).catch(cleanupError => {
        logger.error('Failed to cleanup chunks', { 
          documentId: documentId as string,
          error: cleanupError 
        });
      });

      await prisma.projectDocument.update({
        where: { id: documentId as string },
        data: {
          processingStatus: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(updateError => {
        logger.error('Failed to update document status', { 
          documentId: documentId as string,
          error: updateError 
        });
      });
    }

    return apiError(res, 500, 'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
