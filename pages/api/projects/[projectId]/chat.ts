import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getMistralApiKeyFromRequest } from '@/lib/mistral';
import { createEmbeddings, findTopKSimilar } from '@/lib/embedding';
import { apiError } from '@/lib/api-helpers';
import { sanitizeTextForContext } from '@/lib/api-helpers';
import { VECTOR_SEARCH, DOCUMENT_PROCESSING, CONVERSATION } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';
import { cache, getCacheKey } from '@/lib/cache';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return apiError(res, 405, 'Method not allowed');
  }

  if (!checkRateLimit(req, res, 20, 60000)) {
    return apiError(res, 429, 'Too many requests. Please try again later.');
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
    const project = await prisma.project.findFirst({
      where: {
        id: projectId as string,
        userId: user.id,
      },
    });

    if (!project) {
      return apiError(res, 404, 'Project not found or access denied');
    }

    const { message, conversationId } = req.body as { message: string; conversationId?: string };

    if (!message || !message.trim()) {
      return apiError(res, 400, 'Message is required');
    }

    const apiKey = getMistralApiKeyFromRequest(req) || MISTRAL_API_KEY;

    if (!apiKey) {
      return apiError(res, 400, 'Mistral API key is required');
    }

    let conversation;
    if (conversationId) {
      conversation = await prisma.projectConversation.findFirst({
        where: {
          id: conversationId,
          projectId: projectId as string,
          userId: user.id,
        },
      });
    }

    if (!conversation) {
      conversation = await prisma.projectConversation.create({
        data: {
          projectId: projectId as string,
          userId: user.id,
          title: message.slice(0, 100),
        },
      });
    }

    await prisma.projectConversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    logger.info('Chat request', {
      projectId: projectId as string,
      userId: user.id,
      conversationId: conversation.id,
      messageLength: message.length,
    });

    const cacheKey = getCacheKey('chunks', projectId as string);
    let chunks = cache.get<any[]>(cacheKey);

    if (!chunks) {
      chunks = await prisma.documentChunk.findMany({
        where: {
          projectId: projectId as string,
          document: {
            isActive: true,
            processingStatus: 'completed',
          },
        },
        select: {
          id: true,
          content: true,
          embedding: true,
          document: {
            select: { name: true },
          },
        },
        take: VECTOR_SEARCH.MAX_CHUNKS_TO_SEARCH,
        orderBy: { createdAt: 'desc' },
      });
      
      if (chunks.length > 0) {
        cache.set(cacheKey, chunks, 300);
      }
    }

    const queryEmbeddingArray = await createEmbeddings([message], apiKey);
    const queryEmbedding = queryEmbeddingArray[0];

    if (chunks.length === 0) {
      return apiError(res, 400, 
        'No documents found in this project. Please upload documents first.'
      );
    }

    const topChunks = findTopKSimilar(
      queryEmbedding, 
      chunks, 
      DOCUMENT_PROCESSING.TOP_K_CHUNKS
    );

    if (topChunks.length === 0) {
      logger.warn('No relevant chunks found', {
        projectId: projectId as string,
        totalChunks: chunks.length,
      });
    }

    const context = topChunks
      .map((item, index) => {
        const sanitizedContent = sanitizeTextForContext(item.chunk.content);
        return `[Document ${index + 1}: ${item.chunk.document.name}]\n${sanitizedContent}`;
      })
      .join('\n\n---\n\n');

    const systemPrompt = `You are a helpful assistant. Answer the user's question based on the following documents. If the answer is not in the documents, say so clearly.

Context information is below.
---------------------
${context}
---------------------
Given the context information and not prior knowledge, answer the query.`;

    const history = await prisma.projectConversationMessage.findMany({
      where: { 
        conversationId: conversation.id,
      },
      orderBy: { createdAt: 'asc' },
      take: CONVERSATION.MAX_HISTORY_MESSAGES,
    });

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...history.slice(0, -1).map(h => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Mistral Chat API Error', {
        status: response.status,
        error: errorText,
      });
      return apiError(res, response.status, `Mistral API Error: ${response.status}`, errorText);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('X-Conversation-Id', conversation.id);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let inputTokens = 0;
    let outputTokens = 0;

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  assistantMessage += parsed.choices[0].delta.content;
                }
                if (parsed.usage) {
                  inputTokens = parsed.usage.prompt_tokens || 0;
                  outputTokens = parsed.usage.completion_tokens || 0;
                }
              } catch (e) {}
            }
          }

          res.write(chunk);
        }
      } catch (streamError) {
        logger.error('Streaming error', { error: streamError });
      } finally {
        reader.releaseLock();
      }
    }

    if (assistantMessage) {
      await prisma.projectConversationMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: assistantMessage,
        },
      });

      await prisma.projectConversation.update({
        where: { id: conversation.id },
        data: { 
          messagesCount: { increment: 2 },
          updatedAt: new Date(),
        },
      });

      if (inputTokens || outputTokens) {
        await prisma.usageLog.create({
          data: {
            userId: user.id,
            model: 'mistral-large-latest',
            inputTokens: inputTokens || Math.ceil(context.length / 4),
            outputTokens: outputTokens || Math.ceil(assistantMessage.length / 4),
            totalTokens: (inputTokens || Math.ceil(context.length / 4)) + (outputTokens || Math.ceil(assistantMessage.length / 4)),
            requestType: 'project_chat',
          },
        }).catch(err => {
          logger.error('Failed to log usage', { error: err });
        });
      }
    }

    res.end();
  } catch (error) {
    logger.error('Project Chat API Error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    if (!res.headersSent) {
      return apiError(res, 500, errorMessage);
    }
  }
}
