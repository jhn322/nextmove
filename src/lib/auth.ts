import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DefaultSession } from "next-auth";
import { CustomSupabaseAdapter } from "./supabase-adapter";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Determine the base URL based on environment
const getBaseUrl = () => {
  // For production, always use the main domain
  if (process.env.NODE_ENV === "production") {
    return "https://next-move-js.vercel.app";
  }

  // For Vercel preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // If NEXTAUTH_URL is explicitly set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Default to localhost in development
  return "http://localhost:3000";
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: CustomSupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        console.log(
          "[next-auth] JWT callback - adding user ID to token:",
          user.id
        );
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("[next-auth] Session callback - token:", token);
      console.log("[next-auth] Session callback - user:", user);

      // For database strategy, user is passed directly
      if (user) {
        session.user.id = user.id;
        console.log(
          "[next-auth] Session callback - setting ID from user:",
          user.id
        );
      }
      // For JWT strategy, token is passed
      else if (token) {
        session.user.id = token.id as string;
        console.log(
          "[next-auth] Session callback - setting ID from token:",
          token.id
        );
      }

      console.log("[next-auth] Session callback - final session:", session);
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[next-auth] Redirect callback:", { url, baseUrl });

      // Dynamically determine the base URL
      const dynamicBaseUrl = getBaseUrl();

      if (url.startsWith(dynamicBaseUrl)) return url;

      if (url.startsWith("/")) return `${dynamicBaseUrl}${url}`;

      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(dynamicBaseUrl);
        if (urlObj.origin === baseUrlObj.origin) return url;
      } catch {}

      return dynamicBaseUrl;
    },
  },
  events: {
    async signIn(message) {
      console.log("[next-auth] SignIn event:", message);
    },
    async signOut(message) {
      console.log("[next-auth] SignOut event:", message);
    },
    async createUser(message) {
      console.log("[next-auth] CreateUser event:", message);
    },
    async linkAccount(message) {
      console.log("[next-auth] LinkAccount event:", message);
    },
    async session(message) {
      console.log("[next-auth] Session event:", message);
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
