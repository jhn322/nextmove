// Assuming utils and constants are in lib/auth/utils and lib/auth/constants
import { getEnvVar } from "@/lib/utils/env";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AUTH_MESSAGES, USER_ROLES } from "@/lib/auth/constants/auth";
import { type TokenSet } from "next-auth";
import { DEFAULT_START_ELO } from "@/lib/elo";
import type { User as AuthUser } from "next-auth";

/**
 * Provider configuration for NextAuth
 */
export const configureProviders = () => [
  GoogleProvider({
    clientId: getEnvVar("GOOGLE_CLIENT_ID"),
    clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    profile(profile: GoogleProfile, _tokens: TokenSet) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        role: USER_ROLES.USER,
        elo: DEFAULT_START_ELO,
      };
    },
  }),
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error(AUTH_MESSAGES.ERROR_MISSING_FIELDS);
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        // Use a specific internal error to indicate that the user was not found
        throw new Error("User not found");
      }

      // Validate the password first
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        // Use a specific internal error to indicate incorrect password
        throw new Error(
          AUTH_MESSAGES.ERROR_INVALID_CREDENTIALS || "Incorrect password"
        );
      }

      // Check if the user has verified their email only after the password has been validated
      if (!user.emailVerified) {
        // Use a specific error message for this case
        throw new Error(
          AUTH_MESSAGES.ERROR_EMAIL_NOT_VERIFIED || "EMAIL_NOT_VERIFIED"
        );
      }

      // Return only the fields NextAuth expects, with correct types
      return mapPrismaUserToAuthUser(user);
    },
  }),
];

// ** Helper to map Prisma user to NextAuth user ** //
const mapPrismaUserToAuthUser = (user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  elo: number;
  countryFlag?: string | null;
  flair?: string | null;
  pieceSet?: string | null;
  timezone?: string | null;
  clockFormat?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  preferredDifficulty?: string | null;
  soundEnabled?: boolean | null;
  whitePiecesBottom?: boolean | null;
  showCoordinates?: boolean | null;
  enableAnimations?: boolean | null;
  enableConfetti?: boolean | null;
  highContrast?: boolean | null;
  autoQueen?: boolean | null;
  moveInputMethod?: string | null;
  boardTheme?: string | null;
  enablePreMadeMove?: boolean | null;
  showLegalMoves?: boolean | null;
  highlightSquare?: boolean | null;
}): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  elo: user.elo,
  countryFlag: user.countryFlag ?? null,
  flair: user.flair ?? null,
  pieceSet: user.pieceSet ?? null,
  timezone: user.timezone ?? null,
  clockFormat: user.clockFormat ?? null,
  firstName: user.firstName ?? null,
  lastName: user.lastName ?? null,
  location: user.location ?? null,
  preferredDifficulty: user.preferredDifficulty ?? null,
  soundEnabled: user.soundEnabled ?? null,
  whitePiecesBottom: user.whitePiecesBottom ?? null,
  showCoordinates: user.showCoordinates ?? null,
  enableAnimations: user.enableAnimations ?? null,
  enableConfetti: user.enableConfetti ?? null,
  highContrast: user.highContrast ?? null,
  autoQueen: user.autoQueen ?? null,
  moveInputMethod: ["click", "drag", "both"].includes(
    user.moveInputMethod ?? ""
  )
    ? (user.moveInputMethod as "click" | "drag" | "both")
    : null,
  boardTheme: user.boardTheme ?? null,
  enablePreMadeMove: user.enablePreMadeMove ?? null,
  showLegalMoves: user.showLegalMoves ?? null,
  highlightSquare: user.highlightSquare ?? null,
});
