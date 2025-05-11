// import { Resend } from "resend";
import { getEnvVar } from "@/lib/utils/env";
import { API_AUTH_PATHS } from "@/lib/constants/routes";
import { APP_NAME } from "@/lib/constants/site";

/**
 * Sends a password reset email to the specified user using Brevo.
 * @param email - The recipient's email address.
 * @param token - The password reset token (unhashed).
 * @throws Will throw an error if configuration is missing or the API call fails.
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  // * 1. Get Configuration from Environment Variables
  const brevoApiKey = getEnvVar("BREVO_API_KEY");
  const senderEmail = getEnvVar("EMAIL_FROM_ADDRESS");
  const senderName = getEnvVar("EMAIL_FROM_NAME") || APP_NAME; // Fallback to APP_NAME if not set
  const baseUrl = getEnvVar("NEXT_PUBLIC_APP_URL");

  // * 2. Construct Reset URL and Payload
  const resetLink = `${baseUrl}/auth/reset-password?token=${token}`; // Assuming this is your frontend path
  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: email }],
    subject: `Reset Your Password for ${APP_NAME}`,
    htmlContent: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset for your account with ${APP_NAME}.</p>
      <p>Please click the link below to set a new password:</p>
      <a href="${resetLink}" target="_blank" rel="noopener noreferrer">Reset My Password</a>
      <p>This link is valid for a limited time (e.g., 1 hour).</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <br>
      <p>Best regards,</p>
      <p>The ${APP_NAME} Team</p>
    `,
  };

  // * 3. Send Email via Brevo HTTP API
  console.log(
    `Attempting to send password reset email to ${email} via Brevo HTTP API...`
  );
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // * 4. Handle API Response
    if (!response.ok) {
      const errorBodyText = await response.text();
      let errorBody = {};
      try {
        errorBody = JSON.parse(errorBodyText);
      } catch {
        errorBody = { rawMessage: errorBodyText };
      }
      console.error(
        "Brevo HTTP API Error (Password Reset):",
        response.status,
        response.statusText,
        errorBody
      );
      throw new Error(
        `Failed to send password reset email via Brevo HTTP API: ${response.status} ${response.statusText}. Details: ${errorBodyText}`
      );
    }

    const responseData = await response.json();
    console.log(
      `Password reset email dispatched successfully via Brevo HTTP API to ${email}:`,
      responseData
    );
  } catch (error) {
    console.error(
      `Error during Brevo HTTP API call for password reset to ${email}:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Sends an email verification link to the specified user using Brevo.
 * @param email - The recipient's email address.
 * @param token - The email verification token (unhashed).
 * @throws Will throw an error if configuration is missing or the API call fails.
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  // * 1. Get Configuration from Environment Variables
  const brevoApiKey = getEnvVar("BREVO_API_KEY");
  const senderEmail = getEnvVar("EMAIL_FROM_ADDRESS");
  const senderName = getEnvVar("EMAIL_FROM_NAME"); // Or use APP_NAME as a fallback: getEnvVar('EMAIL_FROM_NAME') || APP_NAME;
  const baseUrl = getEnvVar("NEXT_PUBLIC_APP_URL");

  // * 2. Construct Verification URL and Payload
  // Using API_AUTH_PATHS.VERIFY_EMAIL from your constants
  const verificationUrl = `${baseUrl}${API_AUTH_PATHS.VERIFY_EMAIL}?token=${token}`;
  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: email }],
    subject: `Verify your email address for ${APP_NAME}`,
    // TODO: Consider replacing with a more robust HTML template solution (e.g., React Email)
    htmlContent: `
      <h1>Verify your email address</h1>
      <p>Thank you for registering with ${APP_NAME}!</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer">Verify my email</a>
      <p>This link is valid for 24 hours.</p>
      <p>If you did not register, please ignore this email.</p>
      <br>
      <p>Best regards,</p>
      <p>The ${APP_NAME} Team</p>
    `,
  };

  // * 3. Send Email via Brevo HTTP API
  console.log(
    `Attempting to send verification email to ${email} via Brevo HTTP API...`
  );
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // * 4. Handle API Response
    if (!response.ok) {
      const errorBodyText = await response.text(); // Get raw text first
      let errorBody = {};
      try {
        errorBody = JSON.parse(errorBodyText); // Try to parse as JSON
      } catch {
        errorBody = { rawMessage: errorBodyText }; // Fallback to raw text
      }
      console.error(
        "Brevo HTTP API Error:",
        response.status,
        response.statusText,
        errorBody
      );
      throw new Error(
        `Failed to send email via Brevo HTTP API: ${response.status} ${response.statusText}. Details: ${errorBodyText}`
      );
    }

    const responseData = await response.json();
    console.log(
      `Verification email dispatched successfully via Brevo HTTP API to ${email}:`,
      responseData // Contains messageId etc.
    );
  } catch (error) {
    console.error(
      `Error during Brevo HTTP API call for ${email}:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};
