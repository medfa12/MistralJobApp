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

    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Get project to verify ownership and get Mistral library ID
    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete library from Mistral
    try {
      const mistralResponse = await fetch(
        `https://api.mistral.ai/v1/libraries/${project.mistralLibraryId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          },
        }
      );

      if (!mistralResponse.ok) {
        console.error('Failed to delete Mistral library:', await mistralResponse.text());
        // Continue with database deletion even if Mistral deletion fails
      }
    } catch (error) {
      console.error('Error deleting Mistral library:', error);
      // Continue with database deletion
    }

    // Delete project from database (cascade will delete documents)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

