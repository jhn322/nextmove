import { DefaultSession, DefaultUser } from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      elo: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      countryFlag?: string | null;
      flair?: string | null;
      pieceSet?: string | null;
      timezone?: string | null;
      clockFormat?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      location?: string | null;
      preferredDifficulty?: string | null;
      soundEnabled?: boolean | null;
      whitePiecesBottom?: boolean | null;
      showCoordinates?: boolean | null;
      enableAnimations?: boolean | null;
      enableConfetti?: boolean | null;
      highContrast?: boolean | null;
      autoQueen?: boolean | null;
      moveInputMethod?: "click" | "drag" | "both" | null;
      boardTheme?: string | null;
      enablePreMadeMove?: boolean | null;
      showLegalMoves?: boolean | null;
      highlightSquare?: boolean | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    elo: number;
    image?: string | null;
    countryFlag?: string | null;
    flair?: string | null;
    pieceSet?: string | null;
    timezone?: string | null;
    clockFormat?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    location?: string | null;
    preferredDifficulty?: string | null;
    soundEnabled?: boolean | null;
    whitePiecesBottom?: boolean | null;
    showCoordinates?: boolean | null;
    enableAnimations?: boolean | null;
    enableConfetti?: boolean | null;
    highContrast?: boolean | null;
    autoQueen?: boolean | null;
    moveInputMethod?: "click" | "drag" | "both" | null;
    boardTheme?: string | null;
    enablePreMadeMove?: boolean | null;
    showLegalMoves?: boolean | null;
    highlightSquare?: boolean | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    elo: number;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    countryFlag?: string | null;
    flair?: string | null;
    pieceSet?: string | null;
    timezone?: string | null;
    clockFormat?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    location?: string | null;
    preferredDifficulty?: string | null;
    soundEnabled?: boolean | null;
    whitePiecesBottom?: boolean | null;
    showCoordinates?: boolean | null;
    enableAnimations?: boolean | null;
    enableConfetti?: boolean | null;
    highContrast?: boolean | null;
    autoQueen?: boolean | null;
    moveInputMethod?: "click" | "drag" | "both" | null;
    boardTheme?: string | null;
    enablePreMadeMove?: boolean | null;
    showLegalMoves?: boolean | null;
    highlightSquare?: boolean | null;
  }
}
