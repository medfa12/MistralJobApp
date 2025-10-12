import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { db } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username, email, firstName, lastName, job, bio } = req.body;

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username && username !== currentUser.username) {
      const existingUser = await db.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    if (email && email !== currentUser.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        username: username || currentUser.username,
        email: email || currentUser.email,
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
        job: job || currentUser.job,
        bio: bio || currentUser.bio,
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        job: true,
        role: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
