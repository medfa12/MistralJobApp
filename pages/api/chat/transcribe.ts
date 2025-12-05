import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/m4a',
  'audio/mp4',
];

async function cleanupFile(filepath: string): Promise<void> {
  try {
    if (existsSync(filepath)) {
      await fs.unlink(filepath);
    }
  } catch (err) {
    console.error('Failed to cleanup temp file:', err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
  let tempFilePath: string | null = null;

  try {
    const [fields, files] = await form.parse(req);

    const audioFile = files.audio?.[0] as FormidableFile | undefined;
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    tempFilePath = audioFile.filepath;

    const mimeType = audioFile.mimetype || 'audio/webm';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      await cleanupFile(tempFilePath);
      return res.status(400).json({ error: 'Invalid audio file type' });
    }

    if (!apiKey) {
      await cleanupFile(tempFilePath);
      return res.status(500).json({ error: 'Mistral API key not configured on server' });
    }

    const fileBuffer = await fs.readFile(audioFile.filepath);
    const blob = new Blob([fileBuffer], { type: mimeType });

    const safeFilename = (audioFile.originalFilename || 'audio.webm')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 100);

    const formData = new FormData();
    formData.append('file', blob, safeFilename);
    formData.append('model', 'voxtral-mini-latest');

    const response = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      await cleanupFile(tempFilePath);
      const errorText = await response.text();
      console.error('Mistral transcription error:', errorText);
      return res.status(response.status).json({
        error: 'Transcription failed',
      });
    }

    const result = await response.json();

    res.status(200).json(result);

    await cleanupFile(tempFilePath);
  } catch (error) {
    if (tempFilePath) {
      await cleanupFile(tempFilePath);
    }
    console.error('Transcription error:', error);
    return res.status(500).json({
      error: 'Failed to transcribe audio',
    });
  }
}
