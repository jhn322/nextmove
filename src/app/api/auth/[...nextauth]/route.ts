import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

/**
 * Denna handler hanterar GET och POST-förfrågningar till /api/auth/*
 * Den använder konfigurationen från authOptions för att hantera autentisering
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };