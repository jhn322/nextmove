import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // Import crypto
import prisma from "@/lib/prisma";
import { USER_ROLES, AUTH_MESSAGES } from "@/lib/auth/constants/auth";
import { registerApiSchema } from "@/lib/validations/auth/register"; // Importera nya schemat
import { ZodIssue } from "zod"; // Importera ZodIssue
import { sendVerificationEmail } from "@/lib/email/resend"; // Import our new function

const HASH_ROUNDS = 10;
// Email verification token expires in 24 hours (adjust as needed)
const TOKEN_EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

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

    //* Validera input med det nya API-schemat
    const validationResult = registerApiSchema.safeParse(body); // Använd nya schemat

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(
        (e: ZodIssue) => e.message
      ); // Använd ZodIssue typen
      return NextResponse.json(
        // Använd specifikt fel eller standard om join är tom
        { message: errors.join(", ") || AUTH_MESSAGES.ERROR_MISSING_FIELDS },
        { status: 400 }
      );
    }

    // Nu innehåller validationResult.data bara name, email, password
    const { name, email, password } = validationResult.data;

    //* Kolla om användaren redan finns, inkludera konton
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }, // Inkludera länkade konton
    });

    if (existingUser) {
      //* Kolla om det finns några länkade OAuth-konton
      if (existingUser.accounts && existingUser.accounts.length > 0) {
        // Användaren finns och har loggat in via OAuth tidigare
        return NextResponse.json(
          { message: AUTH_MESSAGES.ERROR_EMAIL_EXISTS_OAUTH }, // Ge specifikt felmeddelande
          { status: 409 } // Använd 409 Conflict
        );
      } else {
        // Användaren finns men har inga OAuth-konton (troligen skapad med credentials)
        return NextResponse.json(
          { message: AUTH_MESSAGES.ERROR_EMAIL_EXISTS },
          { status: 409 } // Använd 409 Conflict
        );
      }
    }

    //* Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    //* Skapa användaren (om ingen fanns)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: USER_ROLES.USER, // Använd konstant
        emailVerified: null, // Explicitly null until verified
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
          userId: user.id, // Link to the created user
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
      // Optionally, you could delete the user here if verification email fails critically,
      // but that might be a poor user experience.
    }
    // --- End Email Verification Process ---

    // Ta bort lösenordet från svaret
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email to verify your account.",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error); // Changed log prefix
    // Använd mer generellt registreringsfel här
    return NextResponse.json(
      { message: AUTH_MESSAGES.ERROR_REGISTRATION_FAILED },
      { status: 500 }
    );
  }
}
