import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
// import { registerFormSchema } from "@/lib/validations/auth/register"; // Removed unused import
import type { AuthFormData } from "@/components/auth/AuthForm/types";
import { AUTH_MESSAGES, AUTH_ROUTES } from "@/lib/auth/constants/auth";
import { registerUser } from "@/services/auth/mutations/register";
import { z } from "zod";

interface UseAuthFormProps {
  mode: "login" | "register";
  onSuccess?: () => void;
}

export const useAuthForm = ({ mode, onSuccess }: UseAuthFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        // Remove redundant validation - data is already validated by react-hook-form
        // const validatedData = registerFormSchema.parse({ ... });

        // Directly use the validated data passed from the form
        const result = await registerUser({
          // Zod validation in AuthForm ensures name is a valid string in register mode
          name: data.name!, // Use non-null assertion, or default: data.name || ''
          email: data.email,
          password: data.password,
        });

        if (!result.success) {
          // console.error("registerUser call failed or returned success: false. Result:", result); // Removed log
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
          // Hantera specifika fel från NextAuth authorize
          if (result.error === "CredentialsSignin") {
            // NextAuth ger detta generiska fel, men vi kan härleda det från context
            throw new Error(AUTH_MESSAGES.ERROR_INVALID_CREDENTIALS);
          } else if (result.error === "User not found") {
            throw new Error(AUTH_MESSAGES.ERROR_INVALID_CREDENTIALS);
          } else if (result.error === "Incorrect password") {
            throw new Error(AUTH_MESSAGES.ERROR_INVALID_CREDENTIALS);
          } else if (result.error === "EMAIL_NOT_VERIFIED") {
            throw new Error(AUTH_MESSAGES.ERROR_EMAIL_NOT_VERIFIED);
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
    } catch (error) {
      // console.error("Error caught in useAuthForm handleSubmit:", error); // Removed log

      // Hantera Zod valideringsfel specifikt (Shouldn't happen anymore for register if redundant parse is removed)
      if (error instanceof z.ZodError) {
        setError(error.errors.map((e) => e.message).join(", "));
      } else {
        setError(
          error instanceof Error ? error.message : AUTH_MESSAGES.ERROR_DEFAULT
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
