import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { strictAuthRateLimit } from '../../../lib/rate-limit';
import { validatePasswordWithContext } from '../../../lib/password-validation';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current session
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Check if new password is same as old password
    if (oldPassword === newPassword) {
      return res.status(400).json({ 
        error: 'New password must be different from current password' 
      });
    }

    // Find the current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // ✅ Validate new password strength
    const passwordValidation = validatePasswordWithContext(newPassword, {
      email: user.email,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    });

    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply strict rate limiting: 3 password changes per hour
export default strictAuthRateLimit(handler);

