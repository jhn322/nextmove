import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

/**
 * Generates a secure random token for email verification or password reset
 * @returns
 */
export function generateToken(): string {
  const token = randomBytes(32).toString("hex");
  console.log(`New generated token starts with: ${token.substring(0, 10)}...`);
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
  console.log(`Starting createVerificationToken for ${email}`);

  // Generate token first so we have it ready
  const token = generateToken();

  // Set expiration date
  const expires = new Date();
  expires.setHours(expires.getHours() + expiresIn);

  console.log(`Deleting existing tokens for ${email}`);

  // Delete any existing tokens for this user
  try {
    const deleteResult = await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });
    console.log(`${deleteResult.count} old tokens deleted for ${email}`);
  } catch (error) {
    console.error(`Error deleting old tokens for ${email}:`, error);
    // Continue anyway, this is just a precaution
  }

  console.log(`Creating new token for ${email}: ${token.substring(0, 10)}...`);

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
      console.log(
        `Token confirmed in database for ${email}, expires: ${createdToken.expires.toISOString()}`
      );
    }
  } catch (error) {
    console.error(`Error creating token for ${email}:`, error);
    throw error; // This is a critical error, so we rethrow it
  }

  console.log(`Returning token for ${email}: ${token.substring(0, 10)}...`);
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
  console.log(
    `Validating token for ${email || "unknown"}: ${token.substring(0, 10)}...`
  );

  const whereClause = {
    token,
    ...(email ? { identifier: email } : {}),
    expires: {
      gt: new Date(),
    },
  };

  console.log("Where clause:", JSON.stringify(whereClause, null, 2));

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: whereClause,
  });

  console.log("Token validation result:", !!tokenRecord);
  if (!tokenRecord) {
    // Om ingen token hittades, let's check if it might be expired
    const expiredToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        ...(email ? { identifier: email } : {}),
      },
    });

    if (expiredToken) {
      console.log(
        `Token found but expired. Expired at: ${expiredToken.expires}`
      );
    } else {
      console.log("No token found with the provided values");
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
    console.log(
      `Attempting to consume token for ${email || "unknown"}: ${token.substring(0, 10)}...`
    );

    // For email verification, we just validate without deleting
    // This prevents issues with email clients pre-fetching URLs
    const isValid = await validateVerificationToken(token, email);

    if (!isValid) {
      console.log("Token validation failed, cannot consume");
      return false;
    }

    // We don't delete the token here anymore - it will remain valid until the user
    // is marked as verified in the database, which prevents the pre-fetch issue

    console.log(
      `Token validated successfully, not consumed to prevent prefetch issues`
    );
    return true;
  } catch (error) {
    console.error("Error consuming verification token:", error);
    return false;
  }
}
