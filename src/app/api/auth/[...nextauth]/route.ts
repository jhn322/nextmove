import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create a more efficient handler
const handler = NextAuth(authOptions);

// Export the handler functions directly
export { handler as GET, handler as POST };
