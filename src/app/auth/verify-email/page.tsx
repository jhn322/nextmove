"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AUTH_MESSAGES, AUTH_ROUTES } from "@/lib/auth/constants/auth";
import Link from "next/link";

// *VerifyEmailContent component - används för att verifiera användarens e-post
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setError(AUTH_MESSAGES.ERROR_MISSING_FIELDS);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/verify?token=${encodeURIComponent(
            token
          )}&email=${encodeURIComponent(email)}`,
          {
            method: "GET",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setIsVerified(true);
        } else {
          setError(data.message || AUTH_MESSAGES.ERROR_DEFAULT);
        }
      } catch (err) {
        setError(AUTH_MESSAGES.ERROR_DEFAULT);
        console.error("Verification error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, email]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">
            E-postverifiering
          </h1>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">
                {AUTH_MESSAGES.TEXT_VERIFYING}
              </p>
            </div>
          ) : isVerified ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-blue-900">
                {AUTH_MESSAGES.SUCCESS_VERIFICATION}
              </p>
              <div className="pt-4">
                <Link
                  href={AUTH_ROUTES.LOGIN}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Gå till inloggning
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-blue-900">
                Verifiering misslyckades
              </p>
              <p className="text-sm text-gray-600">
                {error || AUTH_MESSAGES.ERROR_DEFAULT}
              </p>
              <div className="pt-4 space-y-2">
                <Link
                  href={AUTH_ROUTES.LOGIN}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Gå till inloggning
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">
            E-postverifiering
          </h1>
        </div>
        <div className="text-center p-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Laddar...</p>
        </div>
      </div>
    </div>
  );
}

// *VerifyEmail component - används för att verifiera användarens e-post
export default function VerifyEmail() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
