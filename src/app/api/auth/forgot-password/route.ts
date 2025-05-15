import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth/forgot-password";
import { sendPasswordResetEmail } from "@/lib/email/brevo";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const HASH_ROUNDS = 10;
// Token expires in 1 hour (3600000 ms)
const TOKEN_EXPIRATION_DURATION = 3600000;

/**
 * Generates a secure random token and its hash.
 * @returns An object containing the token and its hash.
 */
const generateTokenAndHash = async () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(token, HASH_ROUNDS);
  return { token, hash };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    // If no user is found, return a generic message to avoid email enumeration
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with this email exists and uses password login, a reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // If user exists but has no password (aka an OAuth account)
    if (!user.password) {
      return NextResponse.json(
        {
          message:
            "This email address is associated with an account using Google Sign-In. Please try logging in directly with that method. No password reset is required for this account type.",
          isOAuthAccount: true,
        },
        { status: 200 }
      );
    }

    // Check for recent password reset requests (e.g., within the last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentToken = await db.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentToken) {
      return NextResponse.json(
        {
          message:
            "You have already requested a password reset recently. Please try again later or check your email for the existing link.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Generate token and hash
    const { token, hash } = await generateTokenAndHash();
    const expires = new Date(Date.now() + TOKEN_EXPIRATION_DURATION);

    // Store the hashed token in the database
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hash,
        expires: expires,
      },
    });

    // Send the email with the *unhashed* token
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      {
        message:
          "If an account with this email exists and uses password login, a reset link has been sent.",
        isOAuthAccount: false, // Explicitly set for non-OAuth successful password reset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[FORGOT_PASSWORD_POST]", error);
    // Generic error for security
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
