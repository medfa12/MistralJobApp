import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import SettingsClient from './SettingsClient';

export default async function Settings() {
  // Get the current session
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Fetch user data from database
  const user = await db.user.findUnique({
    where: {
      email: session.user.email,
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
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Pass user data to client component
  return <SettingsClient user={user} />;
}
