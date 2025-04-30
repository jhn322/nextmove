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
  // Felmeddelanden
  ERROR_DEFAULT: "Något gick fel. Försök igen.",
  ERROR_INVALID_CREDENTIALS: "Felaktig email eller lösenord.",
  ERROR_MISSING_FIELDS: "Vänligen fyll i alla obligatoriska fält.",
  ERROR_EMAIL_EXISTS: "En användare med denna email finns redan.",
  ERROR_EMAIL_EXISTS_OAUTH:
    "Emailen är redan registrerad via en annan tjänst (t.ex. Google). Prova att logga in med den istället.",
  ERROR_REGISTRATION_FAILED: "Registreringen misslyckades.",
  ERROR_LOGIN_FAILED: "Inloggningen misslyckades.",
  ERROR_GOOGLE_SIGNIN_FAILED: "Inloggning med Google misslyckades.",
  ERROR_PASSWORD_MISMATCH: "Lösenorden matchar inte.",
  ERROR_PASSWORD_REQUIRED: "Lösenord är obligatoriskt.",
  ERROR_UNAUTHORIZED: "Du har inte behörighet att se denna sida.",
  ERROR_VERIFICATION_EMAIL_FAILED: "Kunde inte skicka verifieringsmail.",
  ERROR_INVALID_TOKEN: "Ogiltig eller utgången verifieringslänk.",
  ERROR_ALREADY_VERIFIED: "Din e-post är redan verifierad.",
  ERROR_EMAIL_NOT_VERIFIED:
    "Din e-post har inte verifierats. Vänligen kontrollera din e-post för en verifieringslänk eller begär en ny.",

  // Framgångsmeddelanden
  SUCCESS_REGISTRATION:
    "Registrering lyckades! Kontrollera din inkorg för ett verifieringsmail.",
  SUCCESS_LOGIN: "Inloggning lyckades!",
  SUCCESS_VERIFICATION: "Din e-post har verifierats! Du kan nu logga in.",

  // Informationsmeddelanden
  INFO_VERIFICATION_EMAIL_SENT:
    "Ett verifieringsmail har skickats. Kontrollera din inkorg.",

  // Övriga
  INFO_REGISTRATION_REDIRECT:
    "Registrering lyckades! Omdirigerar till inloggning...",
  TEXT_LOGGING_IN: "Loggar in...",
  TEXT_REGISTERING: "Registrerar...",
  TEXT_PROCESSING: "Bearbetar...",
  TEXT_VERIFYING: "Verifierar...",
} as const;
