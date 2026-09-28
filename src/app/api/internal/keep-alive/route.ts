// GitHub Actions to prevent Atlas M0 pause and Brevo API key inactivity expiry.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pingBrevoApi } from "@/lib/email/brevo";

const KEEP_ALIVE_PATH = "/api/internal/keep-alive";

const MESSAGES = {
  CONFIG_ERROR_MISSING_SECRET: "Configuration error: Missing secret.",
  UNAUTHORIZED: "Unauthorized",
  COMPLETED: "Keep-alive completed.",
  PARTIAL_FAILURE: "Keep-alive finished with failures.",
} as const;

type KeepAliveCheckResult = {
  ok: boolean;
  error?: string;
};

const verifyCronAuthorization = (req: Request): NextResponse | null => {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      `${KEEP_ALIVE_PATH}: CRON_SECRET is not set. Denying access.`,
    );
    return NextResponse.json(
      { message: MESSAGES.CONFIG_ERROR_MISSING_SECRET },
      { status: 500 },
    );
  }

  const expectedToken = `Bearer ${cronSecret}`;
  if (!authHeader || authHeader !== expectedToken) {
    console.warn(
      `${KEEP_ALIVE_PATH}: Unauthorized attempt. Invalid/missing Authorization header.`,
    );
    return NextResponse.json(
      { message: MESSAGES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  return null;
};

const pingMongoDb = async (): Promise<KeepAliveCheckResult> => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown MongoDB ping error";
    console.error(`${KEEP_ALIVE_PATH}: MongoDB ping failed:`, error);
    return { ok: false, error: message };
  }
};

const runKeepAlive = async () => {
  const [mongodb, brevoResult] = await Promise.all([
    pingMongoDb(),
    pingBrevoApi(),
  ]);

  const brevo: KeepAliveCheckResult = brevoResult.ok
    ? { ok: true }
    : { ok: false, error: brevoResult.error };

  const allOk = mongodb.ok && brevo.ok;

  return NextResponse.json(
    {
      message: allOk ? MESSAGES.COMPLETED : MESSAGES.PARTIAL_FAILURE,
      data: { mongodb, brevo },
    },
    { status: allOk ? 200 : 503 },
  );
};

export async function GET(req: Request) {
  const authError = verifyCronAuthorization(req);
  if (authError) {
    return authError;
  }

  return runKeepAlive();
}

export async function POST(req: Request) {
  const authError = verifyCronAuthorization(req);
  if (authError) {
    return authError;
  }

  return runKeepAlive();
}
