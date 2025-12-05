import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';

type UserData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
  role: string;
  isStripeActivated?: boolean;
  stripePriceId?: string | null;
};

export function useUserData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUserData(null);
      setLoading(false);
      return;
    }

    if (status === 'loading') {
      return;
    }

    async function fetchUserData() {
      if (status === 'authenticated' && session?.user?.email) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
          const response = await fetch(`/api/user/profile`, {
            signal: abortControllerRef.current.signal,
          });
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            setUserData(null);
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error fetching user data:', error);
          }
          setUserData(null);
        }
      }
      setLoading(false);
    }

    fetchUserData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session, status]);

  const fullName = userData
    ? [userData.firstName, userData.lastName].filter(Boolean).join(' ') || 'User'
    : session?.user?.name || 'User';

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
    stripePriceId: userData?.stripePriceId || null,
    isSubscriptionActive: userData?.isStripeActivated || false,
    loading,
    isAuthenticated: status === 'authenticated',
  };
}
