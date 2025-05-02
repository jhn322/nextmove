import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth/forgot-password";
import { sendPasswordResetEmail } from "@/lib/email/resend";
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

    // Important: Only allow password reset for users with a password set (not OAuth users)
    // Also, check if email is verified if your flow requires it before reset
    if (!user || !user.password) {
      // Return a generic message to avoid disclosing whether an email exists
      return NextResponse.json(
        {
          message:
            "If an account with this email exists and uses password login, a reset link has been sent.",
        },
        { status: 200 }
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
