"use server";

import { Chess } from "chess.js";
import { type Bot } from "@/components/game/data/bots";
import { saveGameResult, type GameHistory } from "@/lib/game-service"; // Assuming GameHistory is exported
import { clearUserGameHistory } from "@/lib/game-service"; // Assuming clearUserGameHistory is exported

// Interface for the parameters of saveGameAction, mirroring SaveGameResultParams
// but ensuring serializability for server action arguments.
// ChessInstance cannot be directly passed, so we'll pass FEN and reconstruct.
interface SaveGameActionParams {
  userId: string;
  fen: string; // FEN string instead of Chess instance
  // PGN history, potentially for more complex game state reconstruction if needed in the future
  pgnHistory?: string[];
  difficulty: string;
  playerColor: "w" | "b";
  selectedBot: Bot | null; // Ensure Bot is serializable or pass only necessary ID/name
  gameTime: number;
  movesCount: number;
  isResignation?: boolean;
}

export const saveGameAction = async ({
  userId,
  fen,
  // pgnHistory, // Currently unused, but kept for potential future use
  difficulty,
  playerColor,
  selectedBot,
  gameTime,
  movesCount,
  isResignation,
}: SaveGameActionParams): Promise<GameHistory | null> => {
  if (!userId || !selectedBot) {
    console.error("saveGameAction: Missing userId or selectedBot");
    return null;
  }

  const serverGame = new Chess();
  serverGame.load(fen);

  try {
    const result = await saveGameResult({
      userId,
      game: serverGame,
      difficulty,
      playerColor,
      selectedBot,
      gameTime,
      movesCount,
      isResignation,
    });
    return result;
  } catch (error) {
    console.error("Error in saveGameAction calling saveGameResult:", error);
    // Consider returning a more specific error object if needed by the client
    return null;
  }
};

export const clearUserGameHistoryAction = async (
  userId: string
): Promise<boolean> => {
  if (!userId) {
    console.error("clearUserGameHistoryAction: Missing userId");
    return false;
  }
  try {
    // Call the modified service function that only handles DB operations
    const success = await clearUserGameHistory(userId);
    return success;
  } catch (error) {
    console.error(
      "Error in clearUserGameHistoryAction calling clearUserGameHistory:",
      error
    );
    return false;
  }
};
