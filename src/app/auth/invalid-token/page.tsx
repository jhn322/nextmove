"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, BadgeCheck, XCircle } from "lucide-react";
import { APP_NAME } from "@/lib/constants/site";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface StatusInfo {
  title: string;
  message: string;
  icon: React.ElementType;
  colorClass: string;
}

// Map reasons to display messages and icons
const reasonMap: Record<string, StatusInfo> = {
  missing: {
    title: "Missing Token",
    message: "The link is missing the required verification token.",
    icon: AlertTriangle,
    colorClass: "text-yellow-600",
  },
  not_found_or_expired: {
    title: "Invalid or Expired Token",
    message:
      "This verification link is either invalid or has expired. Please request a new one.",
    icon: XCircle,
    colorClass: "text-destructive",
  },
  server_error: {
    title: "Server Error",
    message:
      "An unexpected error occurred while processing your request. Please try again later.",
    icon: AlertTriangle,
    colorClass: "text-destructive",
  },
  already_verified: {
    title: "Already Verified",
    message: "This email address has already been verified.",
    icon: BadgeCheck,
    colorClass: "text-green-600",
  },
  default: {
    title: "Invalid Link",
    message:
      "The link you followed is invalid. Please check the link or contact support.",
    icon: XCircle,
    colorClass: "text-destructive",
  },
};

function InvalidTokenContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "default";

  const {
    title,
    message,
    icon: Icon,
    colorClass,
  } = reasonMap[reason] || reasonMap.default;

  // Basic loading state until reason is read
  if (!reason) {
    return (
      <div className="flex justify-center items-center py-4">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <Icon className={`mx-auto h-12 w-12 ${colorClass}`} aria-hidden="true" />
      <h2 className={`text-2xl font-semibold ${colorClass}`}>{title}</h2>
      <p className="text-muted-foreground">{message}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        {/* Link back to login */}
        <Button asChild variant="outline">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
        {/* Conditionally show link to request new token if relevant */}
        {(reason === "not_found_or_expired" || reason === "missing") && (
          <Button asChild>
            <Link href="/auth/forgot-password">Request New Link</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function InvalidTokenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-md lg:w-[450px]">
        <Link href="/" className="inline-block mb-8 mx-auto">
          <div className="flex items-center justify-center space-x-2 bg-primary/10 w-12 h-12 flex-shrink-0 rounded-xl p-1.5 mx-auto">
            <Image
              className="h-10 w-auto"
              src="/favicon.svg"
              alt={`${APP_NAME} Logo`}
              width={40}
              height={40}
            />
          </div>
        </Link>

        {/* Suspense Boundary for useSearchParams */}
        <React.Suspense
          fallback={
            <div className="flex justify-center items-center py-4">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          <InvalidTokenContent />
        </React.Suspense>
      </div>
    </div>
  );
}
