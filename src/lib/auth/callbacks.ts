import { JWT } from "next-auth/jwt";
import { Session, User, Account, Profile } from "next-auth";
import prisma from "@/lib/prisma";
// Assuming constants are in lib/auth/constants/auth.ts
import { USER_ROLES } from "@/lib/auth/constants/auth";

const DEFAULT_ELO = 600;

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
    // account, // We can use account to check if it's a new OAuth sign-in
  }: {
    token: JWT;
    user?: User; // User object is available on initial sign-in
    _account?: Account | null;
  }) {
    // On initial sign-in (user object is present)
    if (user && user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        token.elo = dbUser.elo ?? DEFAULT_ELO; // Provide default if null
        token.countryFlag = dbUser.countryFlag;
        token.flair = dbUser.flair;
        token.pieceSet = dbUser.pieceSet;
        token.timezone = dbUser.timezone;
        token.clockFormat = dbUser.clockFormat;
        token.firstName = dbUser.firstName;
        token.lastName = dbUser.lastName;
        token.location = dbUser.location;
        token.preferredDifficulty = dbUser.preferredDifficulty;
        token.soundEnabled = dbUser.soundEnabled;
        token.whitePiecesBottom = dbUser.whitePiecesBottom;
        token.showCoordinates = dbUser.showCoordinates;
        token.enableAnimations = dbUser.enableAnimations;
        token.enableConfetti = dbUser.enableConfetti;
        token.highContrast = dbUser.highContrast;
        token.autoQueen = dbUser.autoQueen;
        token.moveInputMethod =
          dbUser.moveInputMethod === "click" ||
          dbUser.moveInputMethod === "drag" ||
          dbUser.moveInputMethod === "both"
            ? dbUser.moveInputMethod
            : null;
        token.boardTheme = dbUser.boardTheme;
        token.enablePreMadeMove = dbUser.enablePreMadeMove;
        token.showLegalMoves = dbUser.showLegalMoves;
        token.highlightSquare = dbUser.highlightSquare;
      } else {
        token.id = user.id; // Use user.id if dbUser not found
        token.role = USER_ROLES.USER;
        token.elo = DEFAULT_ELO;
        console.error(
          `AUTH: User with id ${user.id} not found in JWT callback during initial sign-in. Using defaults.`
        );
      }
    } else if (token.sub) {
      // For subsequent JWT creations (user object is not present, token.sub has user ID)
      // Refresh user data from DB to ensure token is up-to-date
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });
      if (dbUser) {
        token.id = dbUser.id; // Ensure id is set even on refresh
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        token.elo = dbUser.elo ?? DEFAULT_ELO; // Provide default if null
        token.countryFlag = dbUser.countryFlag;
        token.flair = dbUser.flair;
        token.pieceSet = dbUser.pieceSet;
        token.timezone = dbUser.timezone;
        token.clockFormat = dbUser.clockFormat;
        token.firstName = dbUser.firstName;
        token.lastName = dbUser.lastName;
        token.location = dbUser.location;
        token.preferredDifficulty = dbUser.preferredDifficulty;
        token.soundEnabled = dbUser.soundEnabled;
        token.whitePiecesBottom = dbUser.whitePiecesBottom;
        token.showCoordinates = dbUser.showCoordinates;
        token.enableAnimations = dbUser.enableAnimations;
        token.enableConfetti = dbUser.enableConfetti;
        token.highContrast = dbUser.highContrast;
        token.autoQueen = dbUser.autoQueen;
        token.moveInputMethod =
          dbUser.moveInputMethod === "click" ||
          dbUser.moveInputMethod === "drag" ||
          dbUser.moveInputMethod === "both"
            ? dbUser.moveInputMethod
            : null;
        token.boardTheme = dbUser.boardTheme;
        token.enablePreMadeMove = dbUser.enablePreMadeMove;
        token.showLegalMoves = dbUser.showLegalMoves;
        token.highlightSquare = dbUser.highlightSquare;
      } else {
        console.error(
          `AUTH: User with id ${token.sub} not found in JWT callback during refresh. Token may be stale.`
        );
        // Keep existing token.id if dbUser not found, but other fields might be stale
        // If token.id is not set, try token.sub
        token.id = token.id || token.sub || "";
        token.role = token.role || USER_ROLES.USER;
        token.elo = token.elo || DEFAULT_ELO;
      }
    }
    return token;
  },

  /**
   * Session callback runs every time a session is used or updated
   */
  async session({ session, token }: { session: Session; token: JWT }) {
    // The token argument here is the JWT object from the jwt callback
    if (session.user) {
      session.user.id = token.id; // Use token.id which is set from dbUser.id
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      session.user.elo = token.elo ?? DEFAULT_ELO; // Provide default if null/undefined from token
      session.user.countryFlag = token.countryFlag;
      session.user.flair = token.flair;
      session.user.pieceSet = token.pieceSet;
      session.user.timezone = token.timezone;
      session.user.clockFormat = token.clockFormat;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.location = token.location;
      session.user.preferredDifficulty = token.preferredDifficulty;
      session.user.soundEnabled = token.soundEnabled;
      session.user.whitePiecesBottom = token.whitePiecesBottom;
      session.user.showCoordinates = token.showCoordinates;
      session.user.enableAnimations = token.enableAnimations;
      session.user.enableConfetti = token.enableConfetti;
      session.user.highContrast = token.highContrast;
      session.user.autoQueen = token.autoQueen;
      session.user.moveInputMethod =
        token.moveInputMethod === "click" ||
        token.moveInputMethod === "drag" ||
        token.moveInputMethod === "both"
          ? token.moveInputMethod
          : null;
      session.user.boardTheme = token.boardTheme;
      session.user.enablePreMadeMove = token.enablePreMadeMove;
      session.user.showLegalMoves = token.showLegalMoves;
      session.user.highlightSquare = token.highlightSquare;
    }
    return session;
  },
});
