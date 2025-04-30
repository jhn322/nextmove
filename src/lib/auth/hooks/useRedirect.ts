'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_ROUTES, DEFAULT_LOGIN_REDIRECT } from '@/lib/auth/constants/auth';

interface UseRedirectProps {
  defaultRedirect?: string;
}

export const useRedirect = ({ defaultRedirect = DEFAULT_LOGIN_REDIRECT }: UseRedirectProps = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCallbackUrl = (): string => {
    return searchParams?.get('callbackUrl') || defaultRedirect;
  };

  const redirectToCallback = (): void => {
    router.push(getCallbackUrl());
  };

  const redirectToLogin = (additionalParams?: Record<string, string>): void => {
    const currentPath = typeof window !== 'undefined' ? window.location.href : '';
    let path = `${AUTH_ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentPath)}`;

    if (additionalParams) {
      const params = new URLSearchParams();
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.append(key, value);
      });
      path += `&${params.toString()}`;
    }

    router.push(path);
  };

  const redirectToRegister = (): void => {
    router.push(AUTH_ROUTES.REGISTER);
  };

  return {
    getCallbackUrl,
    redirectToCallback,
    redirectToLogin,
    redirectToRegister
  };
};