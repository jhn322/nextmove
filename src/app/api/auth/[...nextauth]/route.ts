import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

/**
 * This handler handles GET and POST requests to /api/auth/*
 * It uses the configuration from authOptions to handle authentication
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
