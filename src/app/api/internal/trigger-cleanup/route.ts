// This route is called by the Vercel Cron Job. It, in turn, calls the
// actual cleanup worker (/api/auth/cleanup-unverified) with the required secret.

import { NextResponse } from "next/server";
import { API_AUTH_PATHS } from "@/lib/constants/routes";

// Helper to safely get environment variables
const getEnvVar = (varName: string, defaultValue?: string): string => {
  const value = process.env[varName];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    console.error(`Environment variable ${varName} is not set.`);
    return "";
  }
  return value;
};

async function handleCleanupTrigger() {
  const internalTriggerPath = "/api/internal/trigger-cleanup";

  const cronSecret = getEnvVar("CRON_SECRET");
  const appUrl = getEnvVar("NEXT_PUBLIC_APP_URL");

  if (!cronSecret) {
    console.error(
      `${internalTriggerPath}: CRON_SECRET is not set. Cannot trigger cleanup worker.`
    );
    return NextResponse.json(
      { message: "Internal configuration error: Missing CRON_SECRET." },
      { status: 500 }
    );
  }

  if (!appUrl) {
    console.error(
      `${internalTriggerPath}: NEXT_PUBLIC_APP_URL is not set. Cannot construct worker URL.`
    );
    return NextResponse.json(
      { message: "Internal configuration error: Missing NEXT_PUBLIC_APP_URL." },
      { status: 500 }
    );
  }

  const workerUrl = `${appUrl}${API_AUTH_PATHS.CLEANUP_UNVERIFIED_USERS}`;

  try {
    const response = await fetch(workerUrl, {
      method: "POST", // The cleanup worker expects POST
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    // Try to parse JSON regardless of ok status, as worker might send error details in JSON
    let responseData = {};
    try {
      responseData = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, try to get text, could be an HTML error page or plain text
      const textResponse = await response.text(); // Attempt to get text response
      console.warn(
        `${internalTriggerPath}: Worker response was not valid JSON. Raw text: ${textResponse.substring(0, 500)}. Error:`,
        jsonError
      );
      responseData = {
        message: "Worker responded with non-JSON output",
        details: textResponse.substring(0, 500),
      };
    }

    if (!response.ok) {
      console.error(
        `${internalTriggerPath}: Error calling worker ${workerUrl}. Status: ${response.status}`,
        responseData
      );
      return NextResponse.json(
        {
          message: `Failed to trigger cleanup worker. Worker responded with status ${response.status}`,
          workerResponse: responseData,
        },
        { status: response.status || 500 } // Use worker's status if available
      );
    }

    return NextResponse.json(
      {
        message: "Cleanup worker triggered successfully.",
        workerResponse: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    // This catch block handles network errors or issues in this trigger function itself
    console.error(
      `${internalTriggerPath}: Exception when trying to call worker ${workerUrl}:`,
      error
    );
    return NextResponse.json(
      { message: "Exception occurred within the trigger cleanup function." },
      { status: 500 }
    );
  }
}

// Vercel Cron jobs can use GET or POST, so supporting both.
export async function GET() {
  return handleCleanupTrigger();
}

export async function POST() {
  return handleCleanupTrigger();
}
