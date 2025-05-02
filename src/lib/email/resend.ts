import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a password reset email to the specified user.
 * @param email - The recipient's email address.
 * @param token - The password reset token (unhashed).
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error("Error: NEXT_PUBLIC_APP_URL is not set.");
    throw new Error("Application URL is not configured.");
  }
  if (!process.env.RESEND_API_KEY) {
    console.error("Error: RESEND_API_KEY is not set.");
    throw new Error("Resend API Key is not configured.");
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  // Use the Resend onboarding address for development/testing
  const fromEmail = "onboarding@resend.dev";
  // Keep sender name consistent or customizable via ENV var
  const fromName = process.env.RESEND_FROM_NAME || "NextMove";

  try {
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `Reset Your ${fromName} Password`,
      html: `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request a password reset, please ignore this email.</p>`,
    });
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // Re-throw a more specific error or handle it as needed
    throw new Error("Failed to send password reset email.");
  }
};
