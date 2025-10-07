import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

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

    const { projectId, documentId } = req.query;

    if (!projectId || typeof projectId !== 'string' || !documentId || typeof documentId !== 'string') {
      return res.status(400).json({ error: 'Project ID and Document ID are required' });
    }

    // Get document and verify ownership
    const document = await prisma.projectDocument.findFirst({
      where: { 
        id: documentId,
        project: {
          id: projectId,
          userId: user.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get status from Mistral
    const mistralResponse = await fetch(
      `https://api.mistral.ai/v1/libraries/${document.project.mistralLibraryId}/documents/${document.mistralDocumentId}/status`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.json();
      console.error('Mistral API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to get document status from Mistral',
        details: errorData 
      });
    }

    const statusData = await mistralResponse.json();

    // Update document in database if status changed
    if (statusData.processing_status !== document.processingStatus) {
      await prisma.projectDocument.update({
        where: { id: documentId },
        data: {
          processingStatus: statusData.processing_status,
          lastProcessedAt: statusData.processing_status === 'Completed' 
            ? new Date() 
            : document.lastProcessedAt,
        },
      });
    }

    return res.status(200).json({
      success: true,
      documentId: statusData.document_id,
      processingStatus: statusData.processing_status,
    });
  } catch (error) {
    console.error('Error checking document status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

