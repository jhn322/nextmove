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
  const senderName = getEnvVar("EMAIL_FROM_NAME") || APP_NAME;
  const baseUrl = getEnvVar("NEXT_PUBLIC_APP_URL");

  // * 2. Construct Reset URL and Payload
  const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;
  const privacyPolicyUrl = `${baseUrl}/privacypolicy`;
  const termsOfServiceUrl = `${baseUrl}/termsofservice`;

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: email }],
    subject: `Reset Your Password for ${APP_NAME}`,
    htmlContent: `
      <body style="margin: 0; padding: 0; width: 100%; color: #E5E7EB; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid #374151;">
                    <h1 style="color: #6904B7; margin: 0; font-size: 28px;">${APP_NAME}</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 30px 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                    <h2 style="color: #D1D5DB; margin-top: 0; margin-bottom: 20px; font-size: 22px;">Reset Your Password</h2>
                    <p style="margin-bottom: 20px;">You requested a password reset for your account with ${APP_NAME}.</p>
                    <p style="margin-bottom: 30px;">Please click the button below to set a new password:</p>
                    <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="background-color: #6904B7; color: #FFFFFF; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset My Password</a>
                    <p style="margin-top: 30px; margin-bottom: 10px;">This link is valid for a limited time (e.g., 1 hour).</p>
                    <p style="margin-bottom: 0;">If you did not request a password reset, please ignore this email.</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px; border-top: 1px solid #374151; font-size: 12px; color: #9CA3AF;">
                    <p style="margin: 0 0 10px 0;">The ${APP_NAME} Team</p>
                    <p style="margin: 0;">
                      <a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" style="color: #9CA3AF; text-decoration: underline; margin-right: 10px;">Privacy Policy</a> |
                      <a href="${termsOfServiceUrl}" target="_blank" rel="noopener noreferrer" style="color: #9CA3AF; text-decoration: underline; margin-left: 10px;">Terms of Service</a>
                    </p>
                    <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
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
  const senderName = getEnvVar("EMAIL_FROM_NAME") || APP_NAME;
  const baseUrl = getEnvVar("NEXT_PUBLIC_APP_URL");

  // * 2. Construct Verification URL and Payload
  const verificationUrl = `${baseUrl}${API_AUTH_PATHS.VERIFY_EMAIL}?token=${token}`;
  const privacyPolicyUrl = `${baseUrl}/privacypolicy`;
  const termsOfServiceUrl = `${baseUrl}/termsofservice`;

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: email }],
    subject: `Verify your email address for ${APP_NAME}`,
    htmlContent: `
      <body style="margin: 0; padding: 0; width: 100%; color: #E5E7EB; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid #374151;">
                    <h1 style="color: #6904B7; margin: 0; font-size: 28px;">${APP_NAME}</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 30px 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                    <h2 style="color: #D1D5DB; margin-top: 0; margin-bottom: 20px; font-size: 22px;">Verify Your Email Address</h2>
                    <p style="margin-bottom: 20px;">Thank you for registering with ${APP_NAME}!</p>
                    <p style="margin-bottom: 30px;">Please click the button below to verify your email address:</p>
                    <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #6904B7; color: #FFFFFF; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify My Email</a>
                    <p style="margin-top: 30px; margin-bottom: 10px;">This link is valid for 24 hours.</p>
                    <p style="margin-bottom: 0;">If you did not register, please ignore this email.</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px; border-top: 1px solid #374151; font-size: 12px; color: #9CA3AF;">
                    <p style="margin: 0 0 10px 0;">The ${APP_NAME} Team</p>
                    <p style="margin: 0;">
                      <a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" style="color: #9CA3AF; text-decoration: underline; margin-right: 10px;">Privacy Policy</a> |
                      <a href="${termsOfServiceUrl}" target="_blank" rel="noopener noreferrer" style="color: #9CA3AF; text-decoration: underline; margin-left: 10px;">Terms of Service</a>
                    </p>
                    <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
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
