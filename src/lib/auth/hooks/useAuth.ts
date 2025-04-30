'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AUTH_ROUTES, UserRole } from '@/lib/auth/constants/auth';

interface UseAuthProps {
  role?: UserRole | UserRole[];
}

/**
 * Hook för att hämta sessionstatus och ev. hantera rollbaserad omdirigering på klienten.
 * Grundläggande skydd för inloggning/utloggning hanteras av middleware.
 */
export const useAuth = ({
  role,
}: UseAuthProps = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';
  const authenticated = status === 'authenticated';
  const unauthenticated = status === 'unauthenticated';

  useEffect(() => {
    if (loading) return; // Gör inget medan sessionen laddas

    // Kontrollera rollbehörighet om specificerad (behålls för klient-sidig kontroll)
    if (role && authenticated) {
      const userRole = session?.user?.role as UserRole;
      const hasAccess = Array.isArray(role)
        ? role.includes(userRole)
        : userRole === role;

      if (!hasAccess) {
        // Om användaren är inloggad men har fel roll, skicka till obehörig-sidan
        router.push(AUTH_ROUTES.UNAUTHORIZED);
      }
    }
  }, [
    loading,
    authenticated,
    role,
    session?.user?.role,
    router
  ]);

  return { session, status, loading, authenticated, unauthenticated };
};
