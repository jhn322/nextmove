import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

/**
 * Generates a secure random token for email verification or password reset
 * @returns A random string token
 */
export function generateToken(): string {
  const token = randomBytes(32).toString('hex');
  console.log(`Nya genererade token börjar med: ${token.substring(0, 10)}...`);
  return token;
}

/**
 * Creates a verification token in the database
 * @param email - The user's email address
 * @param expiresIn - Token expiration time in hours (default: 24)
 * @returns The generated token
 */
export async function createVerificationToken(
  email: string,
  expiresIn = 24
): Promise<string> {
  console.log(`Startar createVerificationToken för ${email}`);

  // Generera token först så vi har det klart
  const token = generateToken();

  // Sätt utgångsdatum
  const expires = new Date();
  expires.setHours(expires.getHours() + expiresIn);

  console.log(`Raderar befintliga tokens för ${email}`);

  // Delete any existing tokens for this user
  try {
    const deleteResult = await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });
    console.log(`${deleteResult.count} gamla tokens raderade för ${email}`);
  } catch (error) {
    console.error(`Fel vid radering av gamla tokens för ${email}:`, error);
    // Fortsätt ändå, detta är bara en säkerhetsåtgärd
  }

  console.log(`Skapar ny token för ${email}: ${token.substring(0, 10)}...`);

  // Create a new token
  try {
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Dubbelkolla att token verkligen har skapats
    const createdToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
      },
    });

    if (!createdToken) {
      console.error(`KRITISKT: Token skapades inte korrekt för ${email}`);
    } else {
      console.log(`Token bekräftad i databasen för ${email}, utgår: ${createdToken.expires.toISOString()}`);
    }
  } catch (error) {
    console.error(`Fel vid skapande av token för ${email}:`, error);
    throw error; // Detta är ett kritiskt fel, så vi kastar det vidare
  }

  console.log(`Returnerar token för ${email}: ${token.substring(0, 10)}...`);
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
  console.log(`Validating token for ${email || 'unknown'}: ${token.substring(0, 10)}...`);

  const whereClause = {
    token,
    ...(email ? { identifier: email } : {}),
    expires: {
      gt: new Date(),
    },
  };

  console.log('Where clause:', JSON.stringify(whereClause, null, 2));

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: whereClause,
  });

  console.log('Token validation result:', !!tokenRecord);
  if (!tokenRecord) {
    // Om ingen token hittades, let's check if it might be expired
    const expiredToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        ...(email ? { identifier: email } : {}),
      },
    });

    if (expiredToken) {
      console.log(`Token found but expired. Expired at: ${expiredToken.expires}`);
    } else {
      console.log('No token found with the provided values');
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
    console.log(`Attempting to consume token for ${email || 'unknown'}: ${token.substring(0, 10)}...`);

    // For email verification, we just validate without deleting
    // This prevents issues with email clients pre-fetching URLs
    const isValid = await validateVerificationToken(token, email);

    if (!isValid) {
      console.log('Token validation failed, cannot consume');
      return false;
    }

    // We don't delete the token here anymore - it will remain valid until the user
    // is marked as verified in the database, which prevents the pre-fetch issue

    console.log(`Token validated successfully, not consumed to prevent prefetch issues`);
    return true;
  } catch (error) {
    console.error('Error consuming verification token:', error);
    return false;
  }
} 