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
 * Huvudkonfiguration för NextAuth
 */
export const authOptions: NextAuthOptions = {
  // Adapter för att koppla NextAuth till Prisma
  adapter: PrismaAdapter(prisma) as Adapter,

  // Providers för olika inloggningsmetoder
  providers: configureProviders(),

  // Session-hantering
  session: {
    strategy: "jwt",
  },

  // Anpassade sidor
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
    error: AUTH_ROUTES.AUTH_ERROR,
  },

  // Callbacks för att anpassa JWT och session
  callbacks: configureCallbacks(),

  // Händelser för autentisering
  events: {
    /**
     * Hanterar användarinloggning specifikt för Google-autentisering
     * - Om användaren finns: Uppdaterar namn och profilbild
     * - Om ny användare: Skapar konto med USER-roll
     * Detta säkerställer att databasen hålls synkroniserad med Google-profildata
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Uppdatera eller skapa användare med rätt roll
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

  // Aktivera debugging i utvecklingsmiljö
  debug: process.env.NODE_ENV === "development",
};
