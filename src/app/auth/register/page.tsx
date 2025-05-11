"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthForm } from "@/components/auth/AuthForm";
import type { AuthFormData } from "@/components/auth/AuthForm/types";
import { useAuthForm } from "@/lib/auth/hooks/useAuthForm";
import { useGoogleAuth } from "@/lib/auth/hooks/useGoogleAuth";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/constants/auth";
import { APP_NAME } from "@/lib/constants/site";

function RegisterContent() {
  const router = useRouter();
  const { status } = useAuth();
  const authenticated = status === "authenticated";
  const authLoading = status === "loading";

  const {
    loading: formLoading,
    error,
    handleSubmit,
    setError,
  } = useAuthForm({
    mode: "register",
    onSuccess: () => router.push(DEFAULT_LOGIN_REDIRECT),
  });

  const { loading: googleLoading, handleGoogleSignIn } = useGoogleAuth({
    onSuccess: () => router.push(DEFAULT_LOGIN_REDIRECT),
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
      <div className="relative hidden lg:block lg:w-[577px]">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/authentication/signout.webp"
          alt="Sign up illustration"
          fill
          sizes="(min-width: 1024px) 577px, 0vw"
          priority
        />
      </div>

      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center space-x-2 bg-primary/10 w-12 h-12 flex-shrink-0 rounded-xl p-1.5">
                <Image
                  className="h-10 w-auto"
                  src="/favicon.svg"
                  alt={`${APP_NAME} Logo`}
                  width={40}
                  height={40}
                />
                <span className="font-bold text-2xl tracking-tight p-2 whitespace-nowrap">
                  {APP_NAME}
                </span>
              </div>
            </Link>
            <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-foreground sm:text-3xl">
              Create your account
            </h2>
            <p className="mt-2 text-md leading-6 text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-primary hover:text-primary/90"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <div className="w-full">
              <GoogleButton
                mode="register"
                onSuccess={handleGoogleSignIn}
                isLoading={isLoading}
              />
            </div>
            <AuthDivider text="Or sign up with email and password" />
            <AuthForm
              mode="register"
              onSubmit={handleFormSubmit}
              isLoading={formLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Spinner className="h-10 w-10" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
