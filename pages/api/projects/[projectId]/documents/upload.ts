import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

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

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file content
    const fileContent = fs.readFileSync(file.filepath);
    const fileName = file.originalFilename || 'document';

    // Create form data for Mistral
    const formData = new FormData();
    const blob = new Blob([fileContent], { type: file.mimetype || 'application/octet-stream' });
    formData.append('file', blob, fileName);

    // Upload to Mistral
    const mistralResponse = await fetch(
      `https://api.mistral.ai/v1/libraries/${project.mistralLibraryId}/documents`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.json();
      console.error('Mistral API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to upload document to Mistral',
        details: errorData 
      });
    }

    const mistralDocument = await mistralResponse.json();

    // Save document to database
    const document = await prisma.projectDocument.create({
      data: {
        projectId: project.id,
        mistralDocumentId: mistralDocument.id,
        name: mistralDocument.name,
        extension: mistralDocument.extension,
        mimeType: mistralDocument.mime_type,
        size: mistralDocument.size,
        numberOfPages: mistralDocument.number_of_pages || null,
        summary: mistralDocument.summary || null,
        processingStatus: mistralDocument.processing_status,
        hash: mistralDocument.hash || null,
        lastProcessedAt: mistralDocument.last_processed_at 
          ? new Date(mistralDocument.last_processed_at) 
          : null,
      },
    });

    // Update project document count and total size
    await prisma.project.update({
      where: { id: project.id },
      data: {
        documentCount: { increment: 1 },
        totalSize: { increment: document.size },
      },
    });

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(201).json({
      success: true,
      document: {
        id: document.id,
        mistralDocumentId: document.mistralDocumentId,
        name: document.name,
        extension: document.extension,
        mimeType: document.mimeType,
        size: document.size,
        numberOfPages: document.numberOfPages,
        summary: document.summary,
        processingStatus: document.processingStatus,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

