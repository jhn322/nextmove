"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useAuthForm } from "@/lib/auth/hooks/useAuthForm";
import { useGoogleAuth } from "@/lib/auth/hooks/useGoogleAuth";
import { useRedirect } from "@/lib/auth/hooks/useRedirect";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/constants/auth";
import { useAuth } from "@/lib/auth/hooks/useAuth";

function LoginContent() {
  const router = useRouter();
  const { redirectToCallback, redirectToRegister } = useRedirect();

  const { authenticated, loading: authLoading } = useAuth();

  const {
    loading: formLoading,
    error,
    handleSubmit,
    setError,
  } = useAuthForm({
    mode: "login",
    onSuccess: redirectToCallback,
  });

  const { loading: googleLoading, handleGoogleSignIn } = useGoogleAuth({
    onSuccess: redirectToCallback,
    onError: (error) => setError(error.message),
  });

  useEffect(() => {
    if (!authLoading && authenticated) {
      router.push(DEFAULT_LOGIN_REDIRECT);
    }
  }, [authenticated, authLoading, router]);

  const isLoading = formLoading || googleLoading || authLoading;

  if (authLoading || authenticated) {
    return <div>Laddar...</div>;
  }

  return (
    <AuthCard
      title="Logga in på Egen Lista"
      description="Fortsätt med Google eller använd ditt konto"
      footer={<AuthFooter mode="login" onNavigate={redirectToRegister} />}
    >
      <GoogleButton
        mode="login"
        onSuccess={handleGoogleSignIn}
        isLoading={isLoading}
      />
      <AuthDivider />
      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Laddar...</div>}>
      <LoginContent />
    </Suspense>
  );
}
