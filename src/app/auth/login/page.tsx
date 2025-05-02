"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthForm } from "@/lib/auth/hooks/useAuthForm";
import type { AuthFormData } from "@/components/auth/AuthForm/types";
import { useGoogleAuth } from "@/lib/auth/hooks/useGoogleAuth";
import { useRedirect } from "@/lib/auth/hooks/useRedirect";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/constants/auth";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";

function LoginContent() {
  const router = useRouter();
  const { redirectToCallback } = useRedirect();
  const { status } = useAuth();
  const authenticated = status === "authenticated";
  const authLoading = status === "loading";

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

  if (authLoading || (!authLoading && authenticated)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const handleFormSubmit = handleSubmit as (
    data: AuthFormData
  ) => Promise<void>;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center space-x-2 bg-primary/10 w-12 h-12 flex-shrink-0 rounded-xl p-1.5">
                <Image
                  className="h-10 w-auto"
                  src="/favicon.svg"
                  alt="NextMove Logo"
                  width={40}
                  height={40}
                />
                <span className="font-bold text-2xl tracking-tight p-2 whitespace-nowrap">
                  NextMove
                </span>
              </div>
            </Link>
            <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-foreground sm:text-3xl">
              Sign in to your account
            </h2>
            <p className="mt-2 text-md leading-6 text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:text-primary/90"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <div className="w-full">
              <GoogleButton
                mode="login"
                onSuccess={handleGoogleSignIn}
                isLoading={isLoading}
              />
            </div>
            <AuthDivider text="Or sign in with email" />
            <AuthForm
              mode="login"
              onSubmit={handleFormSubmit}
              isLoading={formLoading}
              error={error}
            />
          </div>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/signinout/signin.webp"
          alt="Sign in illustration"
          fill
          priority
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Spinner className="h-10 w-10" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
