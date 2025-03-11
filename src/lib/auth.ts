import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DefaultSession } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Simplified base URL function
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  // For Vercel preview deployments
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // For production, always use the main domain
  return process.env.NODE_ENV === "production"
    ? "https://next-move-js.vercel.app"
    : // Default to localhost in development
      "http://localhost:3000";
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Add authorization params to request offline access
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "online",
        },
      },
    }),
  ],
  // Use MongoDB adapter with minimal options
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    // Simple session callback
    session({ session, token }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // Simple JWT callback
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Simple redirect callback
    redirect({ url }) {
      // If it's a relative URL, prepend the base URL
      if (url.startsWith("/")) {
        return `${getBaseUrl()}${url}`;
      }

      // If it's already an absolute URL, use it
      if (url.startsWith("http")) {
        return url;
      }

      // Default to the base URL
      return getBaseUrl();
    },
  },
  // Skip custom pages to avoid additional redirects
  // pages: {
  //   signIn: "/auth/signin",
  //   error: "/auth/error",
  // },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  // Added JWT configuration to make it more efficient
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  // Events for better debugging
  events: {
    async signIn({ user }) {
      console.log("User signed in:", user.email);
    },
  },
};
