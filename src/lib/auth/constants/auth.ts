export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  UNAUTHORIZED: "/unauthorized",
  AUTH_ERROR: "/auth/error",
};

export const DEFAULT_LOGIN_REDIRECT = "/";

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
  AUTH_ROUTES.AUTH_ERROR,
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
];

export const AUTH_MESSAGES = {
  // Error Messages
  ERROR_DEFAULT: "Something went wrong. Please try again.",
  ERROR_INVALID_CREDENTIALS: "Invalid email or password.",
  ERROR_MISSING_FIELDS: "Please fill in all required fields.",
  ERROR_EMAIL_EXISTS: "A user with this email already exists.",
  ERROR_EMAIL_EXISTS_OAUTH:
    "Email already registered via another service (e.g., Google). Try signing in with that instead.",
  ERROR_REGISTRATION_FAILED: "Registration failed.",
  ERROR_LOGIN_FAILED: "Sign in failed.",
  ERROR_GOOGLE_SIGNIN_FAILED: "Sign in with Google failed.",
  ERROR_PASSWORD_MISMATCH: "Passwords do not match.",
  ERROR_PASSWORD_REQUIRED: "Password is required.",
  ERROR_UNAUTHORIZED: "You do not have permission to view this page.",
  ERROR_VERIFICATION_EMAIL_FAILED: "Could not send verification email.",
  ERROR_INVALID_TOKEN: "Invalid or expired verification link.",
  ERROR_ALREADY_VERIFIED: "Your email is already verified.",
  ERROR_EMAIL_NOT_VERIFIED:
    "Your email has not been verified. Please check your email for a verification link or request a new one.",

  // Success Messages
  SUCCESS_REGISTRATION:
    "Registration successful! You can now sign in to your account.",
  SUCCESS_LOGIN: "Sign in successful!",
  SUCCESS_VERIFICATION: "Your email has been verified! You can now sign in.",

  // Information Messages
  INFO_VERIFICATION_EMAIL_SENT:
    "A verification email has been sent. Check your inbox.",

  // Other
  INFO_REGISTRATION_REDIRECT:
    "Registration successful! Redirecting to sign in...",
  TEXT_LOGGING_IN: "Signing in...",
  TEXT_REGISTERING: "Registering...",
  TEXT_PROCESSING: "Processing...",
  TEXT_VERIFYING: "Verifying...",
} as const;
