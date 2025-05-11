import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import type { AuthFormData } from "@/components/auth/AuthForm/types";
import { AUTH_MESSAGES, AUTH_ROUTES } from "@/lib/auth/constants/auth";
import { registerUser } from "@/services/auth/mutations/register";
import { z } from "zod";

// Function to call the resend verification API
const resendVerificationApi = async (email: string) => {
  const response = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to resend verification email." }));
    throw new Error(
      errorData.message || "Failed to resend verification email."
    );
  }
  return response.json();
};

interface UseAuthFormProps {
  mode: "login" | "register";
  onSuccess?: () => void;
}

export const useAuthForm = ({ mode, onSuccess }: UseAuthFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handler for the button inside the custom toast
  const handleRequestNewVerificationEmail = async (email: string) => {
    if (!email) {
      toast.error("Email is not available to resend verification.");
      return;
    }
    setLoading(true);
    try {
      await resendVerificationApi(email);
      toast.success(AUTH_MESSAGES.INFO_VERIFICATION_EMAIL_SENT);
    } catch (apiError) {
      toast.error(
        apiError instanceof Error
          ? apiError.message
          : AUTH_MESSAGES.ERROR_DEFAULT
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        // Directly use the validated data passed from the form
        const result = await registerUser({
          // Zod validation in AuthForm ensures name is a valid string in register mode
          name: data.name!,
          email: data.email,
          password: data.password,
        });

        if (!result.success) {
          throw new Error(
            result.message || AUTH_MESSAGES.ERROR_REGISTRATION_FAILED
          );
        }

        // Show message and redirect to login
        toast.success(AUTH_MESSAGES.SUCCESS_REGISTRATION);
        router.push(`${AUTH_ROUTES.LOGIN}?registered=true`);
      } else {
        //* Logga in användare
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (result?.error) {
          if (result.error === "EMAIL_NOT_VERIFIED") {
            // Directly throw the specific error message to be caught below
            throw new Error(AUTH_MESSAGES.ERROR_EMAIL_NOT_VERIFIED);
          } else if (
            result.error === "CredentialsSignin" ||
            result.error === "User not found" ||
            result.error === "Incorrect password"
          ) {
            throw new Error(AUTH_MESSAGES.ERROR_INVALID_CREDENTIALS);
          } else {
            throw new Error(result.error || AUTH_MESSAGES.ERROR_LOGIN_FAILED);
          }
        } else {
          if (onSuccess) {
            toast.success(AUTH_MESSAGES.SUCCESS_LOGIN);
            onSuccess();
          } else {
            console.error(
              "useAuthForm: onSuccess callback saknas efter lyckad inloggning."
            );
          }
        }
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === AUTH_MESSAGES.ERROR_EMAIL_NOT_VERIFIED
      ) {
        // Special handling for email not verified
        toast.error(AUTH_MESSAGES.ERROR_EMAIL_NOT_VERIFIED, {
          action: {
            label: "Resend Email",
            onClick: () => handleRequestNewVerificationEmail(data.email),
          },
          duration: 10000,
        });
      } else if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join(", "));
      } else {
        setError(
          err instanceof Error ? err.message : AUTH_MESSAGES.ERROR_DEFAULT
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleSubmit,
    setError,
  };
};
