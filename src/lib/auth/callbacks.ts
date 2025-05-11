import { JWT } from "next-auth/jwt";
import { Session, User, Account, Profile } from "next-auth";
import prisma from "@/lib/prisma";
// Assuming constants are in lib/auth/constants/auth.ts
import { USER_ROLES } from "@/lib/auth/constants/auth";

// * Callback configuration for NextAuth

export const configureCallbacks = () => ({
  /**
   ** Runs after successful authentication but before session creation.
   ** Used here to automatically link OAuth accounts to existing
   ** users based on email.
   */
  async signIn({
    user,
    account,
  }: {
    user: User;
    account: Account | null;
    _profile?: Profile;
  }): Promise<boolean | string> {
    // Only run linking for OAuth providers (not credentials)
    if (account && account.provider !== "credentials" && user.email) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        // If user exists but this specific OAuth account is not linked
        if (
          existingUser &&
          !existingUser.accounts.some(
            (acc) =>
              acc.provider === account.provider &&
              acc.providerAccountId === account.providerAccountId
          )
        ) {
          // Link the account
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              scope: account.scope,
              session_state: account.session_state,
              token_type: account.token_type,
            },
          });

          // Here you could also update the user's name/image from the OAuth profile if desired
          // await prisma.user.update({ where: { id: existingUser.id }, data: { name: user.name, image: user.image } });
        }
      } catch (error) {
        console.error("AUTH: Error linking account in signIn callback:", error);
      }
    }
    // Always allow sign-in to continue if no problems occurred
    return true;
  },

  /**
   * JWT callback runs every time a JWT is created or updated
   */
  async jwt({
    token,
    user,
  }: {
    token: JWT;
    user?: User;
    _account?: Account | null;
  }) {
    if (user) {
      // Ensure the token gets the correct role, especially after account linking
      // Fetch the user from DB again to be sure to get the correct role
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser) {
        token.role = dbUser.role;
      } else {
        // Fallback if the user is not found for some reason
        token.role = USER_ROLES.USER;
        console.error(
          `AUTH: User with id ${user.id} not found in JWT callback`
        );
      }
    }
    return token;
  },

  /**
   * Session callback runs every time a session is used or updated
   */
  async session({ session, token }: { session: Session; token: JWT }) {
    if (session.user && token.sub) {
      // Fetch the full user object from DB to include all necessary fields
      const userFromDb = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (userFromDb) {
        session.user.id = userFromDb.id;
        session.user.role = userFromDb.role;
        session.user.name = userFromDb.name;
        session.user.email = userFromDb.email;
        session.user.countryFlag = userFromDb.countryFlag;
        session.user.flair = userFromDb.flair;
        session.user.pieceSet = userFromDb.pieceSet;
        session.user.timezone = userFromDb.timezone;
        session.user.clockFormat = userFromDb.clockFormat;
        session.user.firstName = userFromDb.firstName;
        session.user.lastName = userFromDb.lastName;
        session.user.location = userFromDb.location;
        session.user.preferredDifficulty = userFromDb.preferredDifficulty;
        session.user.soundEnabled = userFromDb.soundEnabled;
        session.user.whitePiecesBottom = userFromDb.whitePiecesBottom;
        session.user.showCoordinates = userFromDb.showCoordinates;
        session.user.enableAnimations = userFromDb.enableAnimations;
        session.user.enableConfetti = userFromDb.enableConfetti;
      } else {
        // Fallback or error handling if user not found in DB
        console.error(
          `AUTH: User with id ${token.sub} not found in session callback`
        );
        // Keep basic info from token if possible
        session.user.id = token.sub;
        if (token.role) {
          session.user.role = token.role as string;
        }
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.picture) {
          session.user.image = token.picture;
        }
        if (token.email) {
          session.user.email = token.email;
        }
      }
    }
    return session;
  },
});
