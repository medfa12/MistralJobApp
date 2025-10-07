import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    const { name, description, emoji } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Create library in Mistral
    const mistralResponse = await fetch('https://api.mistral.ai/v1/libraries', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || `Project: ${name}`,
      }),
    });

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.json();
      console.error('Mistral API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to create library in Mistral',
        details: errorData 
      });
    }

    const mistralLibrary = await mistralResponse.json();

    // Create project in database
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        emoji: emoji || null,
        mistralLibraryId: mistralLibrary.id,
        generatedName: mistralLibrary.generated_name || null,
        generatedDescription: mistralLibrary.generated_description || null,
        totalSize: mistralLibrary.total_size || 0,
        documentCount: mistralLibrary.nb_documents || 0,
      },
    });

    return res.status(201).json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        emoji: project.emoji,
        mistralLibraryId: project.mistralLibraryId,
        documentCount: project.documentCount,
        totalSize: project.totalSize,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

