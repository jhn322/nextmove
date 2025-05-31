// This route is intended to be called by a scheduled job (cron job).
// It finds expired verification tokens and deletes the associated unverified user accounts.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { API_AUTH_PATHS } from "@/lib/constants/routes";

const AUTH_MESSAGES = {
  ERROR_DEFAULT: "An unexpected error occurred. Please try again.",
  CONFIG_ERROR_MISSING_SECRET: "Configuration error: Missing secret.",
  UNAUTHORIZED: "Unauthorized",
};

/**
 * Handles POST requests to clean up unverified users whose verification tokens have expired.
 * - Finds expired VerificationToken records.
 * - For each, checks if the associated User is still unverified (emailVerified is null).
 * - If unverified, deletes the User and the VerificationToken in a transaction.
 * - If user is verified or not found, deletes only the orphaned/expired token.
 */
export async function POST(req: Request) {
  // * 1. Verify Authorization Header (Cron Secret)
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      `POST ${API_AUTH_PATHS.CLEANUP_UNVERIFIED_USERS}: CRON_SECRET is not set. Denying access.`
    );
    return NextResponse.json(
      { message: AUTH_MESSAGES.CONFIG_ERROR_MISSING_SECRET },
      { status: 500 }
    );
  }

  const expectedToken = `Bearer ${cronSecret}`;
  if (!authHeader || authHeader !== expectedToken) {
    console.warn(
      `POST ${API_AUTH_PATHS.CLEANUP_UNVERIFIED_USERS}: Unauthorized attempt. Invalid/missing Authorization header.`
    );
    return NextResponse.json(
      { message: AUTH_MESSAGES.UNAUTHORIZED },
      { status: 401 }
    );
  }

  let deletedUsersCount = 0;
  let deletedTokensCount = 0;

  try {
    // * 2. Find all expired verification tokens
    const now = new Date();
    const expiredTokens = await prisma.verificationToken.findMany({
      where: {
        expires: {
          lt: now,
        },
      },
      select: { id: true, identifier: true }, // Select only needed fields
    });

    if (expiredTokens.length === 0) {
      return NextResponse.json(
        {
          message: "No expired tokens to process.",
          deletedUsers: 0,
          deletedTokens: 0,
        },
        { status: 200 }
      );
    }

    // * 3. Process each expired token
    for (const token of expiredTokens) {
      const user = await prisma.user.findUnique({
        where: { email: token.identifier },
        select: { id: true, emailVerified: true, email: true },
      });

      if (!user) {
        // User associated with the token doesn't exist (e.g., deleted manually).
        // Just delete the orphaned token.
        console.warn(
          `POST ${API_AUTH_PATHS.CLEANUP_UNVERIFIED_USERS}: User ${token.identifier} not found for expired token ${token.id}. Deleting token.`
        );
        await prisma.verificationToken.delete({
          where: { id: token.id },
        });
        deletedTokensCount++;
        continue;
      }

      // * 4. Check if user is still unverified (emailVerified is null)
      if (user.emailVerified === null) {
        try {
          // Use a transaction to ensure both user and token are deleted, or neither.
          await prisma.$transaction([
            prisma.user.delete({
              where: { id: user.id },
            }),
            prisma.verificationToken.delete({
              where: { id: token.id },
            }),
          ]);
          deletedUsersCount++;
          deletedTokensCount++;
        } catch (transactionError) {
          console.error(
            `POST ${API_AUTH_PATHS.CLEANUP_UNVERIFIED_USERS}: Error in transaction deleting user ${user.email} (ID: ${user.id}) and token ${token.id}:`,
            transactionError
          );
          // Continue to the next token; don't let one failure stop the whole batch.
        }
      } else {
        // User is verified, but the token is expired. Just delete the token.
        await prisma.verificationToken.delete({
          where: { id: token.id },
        });
        deletedTokensCount++;
      }
    }

    const summaryMessage = `Cleanup finished. Deleted ${deletedUsersCount} user(s) and ${deletedTokensCount} token(s).`;
    return NextResponse.json(
      {
        message: summaryMessage,
        deletedUsers: deletedUsersCount,
        deletedTokens: deletedTokensCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `POST ${API_AUTH_PATHS.CLEANUP_UNVERIFIED_USERS}: Unexpected error during cleanup process:`,
      error
    );
    return NextResponse.json(
      {
        message: AUTH_MESSAGES.ERROR_DEFAULT,
        deletedUsers: deletedUsersCount,
        deletedTokens: deletedTokensCount,
      },
      { status: 500 }
    );
  }
}
