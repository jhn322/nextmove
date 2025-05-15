"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants/site";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/lib/validations/auth/forgot-password";
import { AUTH_PATHS } from "@/lib/constants/routes";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [isOAuthAccount, setIsOAuthAccount] = React.useState<boolean>(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setIsSuccess(false);
    setPageError(null);
    setSuccessMessage(null);
    setIsOAuthAccount(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const message =
          responseData.message || "Failed to send password reset email.";
        setPageError(message);
        if (response.status !== 429) {
          toast.error(message);
        }
        return;
      }

      setSuccessMessage(responseData.message);
      setIsOAuthAccount(responseData.isOAuthAccount || false);
      setIsSuccess(true);
      if (!responseData.isOAuthAccount) {
        toast.success("Password reset link sent. Please check your inbox.");
      } else {
        toast.info("Please see the information message for more information.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected network error occurred.";
      setPageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center space-x-2 bg-primary/10 w-12 h-12 flex-shrink-0 rounded-xl p-1.5">
                <Image
                  className=""
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
            {!isSuccess && (
              <>
                <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-foreground sm:text-3xl">
                  Forgot Your Password?
                </h2>
                <p className="mt-2 text-md leading-6 text-muted-foreground">
                  Enter your email below to receive a reset link.
                </p>
              </>
            )}
          </div>

          <div className="mt-10">
            {pageError && !isSuccess && (
              <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive dark:border-destructive dark:bg-destructive/20 dark:text-red-400">
                <p>{pageError}</p>
              </div>
            )}

            {isSuccess ? (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-bold leading-9 tracking-tight text-foreground sm:text-3xl">
                  {isOAuthAccount ? "Information" : "Reset Link Sent"}
                </h2>
                <p className="text-muted-foreground">
                  {successMessage ||
                    (isOAuthAccount
                      ? "This account uses Google Sign-In. No password reset is needed."
                      : "Check your email for the reset link!")}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={AUTH_PATHS.LOGIN}>Back to Login</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            autoComplete="email"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            )}

            {!isSuccess && (
              <div className="mt-6 text-center text-sm">
                <Link
                  href={AUTH_PATHS.LOGIN}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Remembered your password? Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/authentication/forgot.webp"
          alt="Person thinking about password reset"
          fill
          priority
        />
      </div>
    </div>
  );
}
