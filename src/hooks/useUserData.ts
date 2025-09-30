import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type UserData = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
  role: string;
};

export function useUserData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch(`/api/user/profile`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    }

    fetchUserData();
  }, [session, status]);

  // Construct full name
  const fullName = userData
    ? [userData.firstName, userData.lastName].filter(Boolean).join(' ') ||
      userData.username ||
      'User'
    : session?.user?.name || 'User';

  // Get initials
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    user: userData,
    fullName,
    initials,
    email: userData?.email || session?.user?.email || '',
    avatar: userData?.avatar || session?.user?.image || null,
    role: userData?.role || 'member',
    loading,
    isAuthenticated: status === 'authenticated',
  };
}

