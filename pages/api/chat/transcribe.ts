import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';

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

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = formidable({ maxFileSize: 50 * 1024 * 1024 });

  try {
    const [fields, files] = await form.parse(req);

    const audioFile = files.audio?.[0] as FormidableFile | undefined;
    const apiKey = fields.apiKey?.[0] || process.env.MISTRAL_API_KEY;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key not provided' });
    }

    const fileBuffer = fs.readFileSync(audioFile.filepath);
    const blob = new Blob([fileBuffer], { type: audioFile.mimetype || 'audio/webm' });
    
    const formData = new FormData();
    formData.append('file', blob, audioFile.originalFilename || 'audio.webm');
    formData.append('model', 'voxtral-mini-latest');

    const response = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    fs.unlinkSync(audioFile.filepath);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral transcription error:', errorText);
      return res.status(response.status).json({
        error: 'Transcription failed',
        details: errorText,
      });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      error: 'Failed to transcribe audio',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

