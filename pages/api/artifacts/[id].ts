import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiRateLimit } from '@/lib/rate-limit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid artifact ID' });
  }

  if (req.method === 'GET') {
    try {
      const artifact = await db.artifact.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!artifact) {
        return res.status(404).json({ error: 'Artifact not found' });
      }

      return res.status(200).json(artifact);
    } catch (error) {
      console.error('Error fetching artifact:', error);
      return res.status(500).json({ error: 'Failed to fetch artifact' });
    }
  } else if (req.method === 'PATCH') {
    try {
      // Verify artifact belongs to user
      const existingArtifact = await db.artifact.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!existingArtifact) {
        return res.status(404).json({ error: 'Artifact not found' });
      }

      const { title, code, language, versions, currentVersion } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (code !== undefined) updateData.code = code;
      if (language !== undefined) updateData.language = language;
      if (versions !== undefined) updateData.versions = versions;
      if (currentVersion !== undefined) updateData.currentVersion = currentVersion;

      const artifact = await db.artifact.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(artifact);
    } catch (error) {
      console.error('Error updating artifact:', error);
      return res.status(500).json({ error: 'Failed to update artifact' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify artifact belongs to user
      const existingArtifact = await db.artifact.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!existingArtifact) {
        return res.status(404).json({ error: 'Artifact not found' });
      }

      await db.artifact.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Artifact deleted successfully' });
    } catch (error) {
      console.error('Error deleting artifact:', error);
      return res.status(500).json({ error: 'Failed to delete artifact' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Apply rate limiting: 60 requests per minute
export default apiRateLimit(handler);

