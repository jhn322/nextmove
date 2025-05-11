// Assuming utils and constants are in lib/auth/utils and lib/auth/constants
import { getEnvVar } from "@/lib/utils/env";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AUTH_MESSAGES, USER_ROLES } from "@/lib/auth/constants/auth";

/**
 * Provider configuration for NextAuth
 */
export const configureProviders = () => [
  GoogleProvider({
    clientId: getEnvVar("GOOGLE_CLIENT_ID"),
    clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        role: USER_ROLES.USER,
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

      return user;
    },
  }),
];
