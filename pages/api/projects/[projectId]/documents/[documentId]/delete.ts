import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
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

    // Delete from Mistral
    try {
      const mistralResponse = await fetch(
        `https://api.mistral.ai/v1/libraries/${document.project.mistralLibraryId}/documents/${document.mistralDocumentId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          },
        }
      );

      if (!mistralResponse.ok) {
        console.error('Failed to delete document from Mistral:', await mistralResponse.text());
        // Continue with database deletion
      }
    } catch (error) {
      console.error('Error deleting document from Mistral:', error);
      // Continue with database deletion
    }

    // Update project totals before deleting document
    await prisma.project.update({
      where: { id: document.projectId },
      data: {
        documentCount: { decrement: 1 },
        totalSize: { decrement: document.size },
      },
    });

    // Delete from database
    await prisma.projectDocument.delete({
      where: { id: documentId },
    });

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

