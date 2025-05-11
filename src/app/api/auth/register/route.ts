import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { USER_ROLES, AUTH_MESSAGES } from "@/lib/auth/constants/auth";
import { registerApiSchema } from "@/lib/validations/auth/register";
import { ZodIssue } from "zod";
import { sendVerificationEmail } from "@/lib/email/brevo";

const HASH_ROUNDS = 10;
// Email verification token expires in 24 hours
const TOKEN_EXPIRATION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Generates a secure random token and its hash.
 * Similar to the password reset token generation.
 * @returns An object containing the token and its hash.
 */
const generateVerificationTokenAndHash = async () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(token, HASH_ROUNDS);
  return { token, hash };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // * Validate input with the new API schema
    const validationResult = registerApiSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(
        (e: ZodIssue) => e.message
      );
      return NextResponse.json(
        // Use specific error or default if join is empty
        { message: errors.join(", ") || AUTH_MESSAGES.ERROR_MISSING_FIELDS },
        { status: 400 }
      );
    }

    // ValidationResult.data only contains name, email, password
    const { name, email, password } = validationResult.data;

    // * Check if the user already exists, include accounts
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }, // Include linked accounts
    });

    if (existingUser) {
      // * Check if there are any linked OAuth accounts
      if (existingUser.accounts && existingUser.accounts.length > 0) {
        // User exists and has logged in via OAuth before
        return NextResponse.json(
          { message: AUTH_MESSAGES.ERROR_EMAIL_EXISTS_OAUTH },
          { status: 409 }
        );
      } else {
        // User exists but has no OAuth accounts
        return NextResponse.json(
          { message: AUTH_MESSAGES.ERROR_EMAIL_EXISTS },
          { status: 409 }
        );
      }
    }

    // * Hash the password
    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    // * Create the user (if none existed)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: USER_ROLES.USER,
        emailVerified: null,
      },
    });

    // --- Start Email Verification Process ---
    try {
      // Generate verification token
      const { token, hash: hashedToken } =
        await generateVerificationTokenAndHash();
      const expires = new Date(Date.now() + TOKEN_EXPIRATION_DURATION);

      // Store the *hashed* token in the new table
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expires: expires,
        },
      });

      // Send the verification email with the *unhashed* token
      await sendVerificationEmail(email, token);
      console.log(`Verification email process initiated for ${email}`);
    } catch (verificationError) {
      console.error(
        `Error during email verification process for ${email}:`,
        verificationError
      );
      // Log the error, but allow registration to succeed.
      // The user can request a resend later if needed.
    }
    // --- End Email Verification Process ---
    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    // General registration error
    return NextResponse.json(
      { message: AUTH_MESSAGES.ERROR_REGISTRATION_FAILED },
      { status: 500 }
    );
  }
}
