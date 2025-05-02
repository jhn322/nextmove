"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./GoogleIcon";
import type { GoogleButtonProps } from "./types";
import {
  AUTH_MESSAGES,
  DEFAULT_LOGIN_REDIRECT,
} from "@/lib/auth/constants/auth";

export const GoogleButton = ({
  onSuccess,
  onError,
  isLoading = false,
}: GoogleButtonProps) => {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: DEFAULT_LOGIN_REDIRECT,
        redirect: false,
      });

      if (result?.error) {
        onError?.(
          new Error(result.error || AUTH_MESSAGES.ERROR_GOOGLE_SIGNIN_FAILED)
        );
      } else if (result?.ok && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error(AUTH_MESSAGES.ERROR_GOOGLE_SIGNIN_FAILED)
      );
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full rounded-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <GoogleIcon />
      Google
    </Button>
  );
};
