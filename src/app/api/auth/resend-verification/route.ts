import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email/resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as z from "zod";

// Basic schema to validate email in request body
const RequestBodySchema = z.object({
  email: z.string().email("Invalid email format."),
});

const HASH_ROUNDS = 10;
const TOKEN_EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const generateVerificationTokenAndHash = async () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(token, HASH_ROUNDS);
  return { token, hash };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = RequestBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }
    const { email } = validation.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    // Check if user exists and is NOT already verified
    if (!user) {
      // Return generic message even if user doesn't exist for security
      return NextResponse.json(
        {
          message:
            "If an account with this email exists and requires verification, a new link has been sent.",
        },
        { status: 200 }
      );
    }
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "This email address has already been verified." },
        { status: 400 }
      );
    }

    // Proceed with generating and sending a new token
    const { token, hash: hashedToken } =
      await generateVerificationTokenAndHash();
    const expires = new Date(Date.now() + TOKEN_EXPIRATION_DURATION);

    // Delete old tokens for this user (optional but good practice)
    await db.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Store the new hashed token
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expires: expires,
      },
    });

    // Send the new verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        message: "A new verification link has been sent to your email address.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESEND_VERIFICATION_POST]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
