import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
// Update import paths to reflect the new location
import { configureProviders } from "./providers";
import { configureCallbacks } from "./callbacks";
// Assuming constants are in lib/auth/constants/auth.ts
import { AUTH_ROUTES, USER_ROLES } from "@/lib/auth/constants/auth";

/**
 * Main configuration for NextAuth
 */
export const authOptions: NextAuthOptions = {
  // Adapter to connect NextAuth to Prisma
  adapter: PrismaAdapter(prisma) as Adapter,

  // Providers for different login methods
  providers: configureProviders(),

  // Session management
  session: {
    strategy: "jwt",
  },

  // Custom pages
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
    error: AUTH_ROUTES.AUTH_ERROR,
  },

  // Callbacks to customize JWT and session
  callbacks: configureCallbacks(),

  // Authentication events
  events: {
    /**
     * Handles user sign-in specifically for Google authentication
     * - If the user exists: Updates name and profile picture
     * - If new user: Creates account with USER role
     * This ensures the database is kept synchronized with Google profile data
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Update or create user with the correct role
        await prisma.user.upsert({
          where: { email: user.email! },
          update: {
            name: user.name,
            image: user.image,
          },
          create: {
            email: user.email!,
            name: user.name!,
            image: user.image,
            role: USER_ROLES.USER,
          },
        });
      }
    },
  },

  // Enable debugging in development environment
  debug: process.env.NODE_ENV === "development",
};
