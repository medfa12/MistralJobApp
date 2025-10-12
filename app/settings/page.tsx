import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

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

  return <SettingsClient user={user} />;
}
