import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

/**
 * Generates a secure random token for email verification or password reset
 * @returns
 */
export function generateToken(): string {
  const token = randomBytes(32).toString("hex");
  return token;
}

/**
 * Creates a verification token in the database
 * @param email - The user's email address
 * @param expiresIn - Token expiration time in 24 hours
 * @returns The generated token
 */
export async function createVerificationToken(
  email: string,
  expiresIn = 24
): Promise<string> {
  // Generate token first so we have it ready
  const token = generateToken();

  // Set expiration date
  const expires = new Date();
  expires.setHours(expires.getHours() + expiresIn);

  // Delete any existing tokens for this user
  try {
    const deleteResult = await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });
    console.log(`Deleting ${deleteResult.count} existing tokens for ${email}`);
  } catch (error) {
    console.error(`Error deleting old tokens for ${email}:`, error);
    // Continue anyway, this is just a precaution
  }

  // Create a new token
  try {
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Double check that the token was created correctly
    const createdToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
      },
    });

    if (!createdToken) {
      console.error(`CRITICAL: Token was not created correctly for ${email}`);
    } else {
    }
  } catch (error) {
    console.error(`Error creating token for ${email}:`, error);
    throw error; // This is a critical error, so we rethrow it
  }

  return token;
}

/**
 * Validates a verification token
 * @param token - The token to validate
 * @param email - The user's email address
 * @returns Boolean indicating if the token is valid
 */
export async function validateVerificationToken(
  token: string,
  email?: string
): Promise<boolean> {
  const whereClause = {
    token,
    ...(email ? { identifier: email } : {}),
    expires: {
      gt: new Date(),
    },
  };

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: whereClause,
  });

  if (!tokenRecord) {
    // Om ingen token hittades, let's check if it might be expired
    const expiredToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        ...(email ? { identifier: email } : {}),
      },
    });

    if (expiredToken) {
    } else {
    }
  }

  return !!tokenRecord;
}

/**
 * Checks a verification token without consuming it
 * This allows email clients' pre-fetching to work without invalidating the token
 * @param token - The token to check
 * @param email - The user's email address
 * @returns Boolean indicating if the token is valid
 */
export async function checkVerificationToken(
  token: string,
  email?: string
): Promise<boolean> {
  return await validateVerificationToken(token, email);
}

/**
 * Consumes a verification token (validates and deletes it)
 * @param token - The token to consume
 * @param email - The user's email address
 * @returns Boolean indicating if the token was successfully consumed
 */
export async function consumeVerificationToken(
  token: string,
  email?: string
): Promise<boolean> {
  try {
    // For email verification, we just validate without deleting
    // This prevents issues with email clients pre-fetching URLs
    const isValid = await validateVerificationToken(token, email);

    if (!isValid) {
      return false;
    }

    // We don't delete the token here anymore - it will remain valid until the user
    // is marked as verified in the database, which prevents the pre-fetch issue

    return true;
  } catch (error) {
    console.error("Error consuming verification token:", error);
    return false;
  }
}

// For Production: Verification tokens expire in 7 days.
const VERIFICATION_TOKEN_EXPIRES_IN_DAYS = 7;

// For testing (e.g., 1-5 minutes):
// const VERIFICATION_TOKEN_EXPIRES_IN_MINUTES = 1;
// Note: If testing with very short expiration, ensure your cron job schedule in vercel.json

/**
 * Calculates the expiration date for a verification token.
 * @returns Date object representing the expiration time.
 */
const getVerificationTokenExpires = (): Date => {
  const expires = new Date();
  // For production (e.g., 7 days)
  expires.setDate(expires.getDate() + VERIFICATION_TOKEN_EXPIRES_IN_DAYS);

  // For testing with minutes:
  // expires.setMinutes(expires.getMinutes() + VERIFICATION_TOKEN_EXPIRES_IN_MINUTES);
  return expires;
};

/**
 * Generates a secure random token string.
 * Typically used for email verification or password resets before hashing.
 * @returns A random hex string.
 */
export function generateRawToken(): string {
  const token = randomBytes(32).toString("hex");
  return token;
}

/**
 * Generates a unique verification token, deletes any existing tokens for the
 * specified email, saves the new token to the database, and returns the token.
 * This stores the *raw* token, suitable for email verification links.
 *
 * @param email - The email address (identifier) for which to generate the token.
 * @returns The generated verification token string.
 * @throws Will throw an error if database operations fail.
 */
export const generateAndSaveVerificationToken = async (
  email: string
): Promise<string> => {
  // * 1. Generate a secure raw token
  const token = generateRawToken();
  const expires = getVerificationTokenExpires();

  try {
    // * 2. Delete any existing verification tokens for this email
    // This ensures only the latest verification link is valid for this purpose.
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // * 3. Save the new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token, // Store the raw token
        expires,
      },
    });

    // * 4. Return the generated token
    return token;
  } catch (error) {
    console.error(
      `Failed to generate or save verification token for ${email}:`,
      error
    );
    throw new Error("Could not process verification token.");
  }
};
