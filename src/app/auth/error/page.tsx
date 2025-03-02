"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const AuthErrorPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Callback":
        return "There was a problem with the authentication callback. This might be due to a configuration issue with the authentication provider.";
      case "OAuthSignin":
        return "Error in the OAuth sign-in process. Please try again.";
      case "OAuthCallback":
        return "Error in the OAuth callback process. Please try again.";
      case "OAuthCreateAccount":
        return "Error creating a user account. Please try again.";
      case "EmailCreateAccount":
        return "Error creating a user account. Please try again.";
      case "Callback":
        return "Error in the authentication callback. Please try again.";
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in using the original provider.";
      case "EmailSignin":
        return "Error sending the email. Please try again.";
      case "CredentialsSignin":
        return "Invalid credentials. Please check your username and password.";
      case "SessionRequired":
        return "You must be signed in to access this page.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="border-2 border-destructive/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 flex-shrink-0 bg-destructive/10 rounded-xl p-3 text-destructive">
              <AlertCircle className="w-full h-full" />
            </div>
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full"
            variant="default"
          >
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">
            If this problem persists, please contact support.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthErrorPage;
