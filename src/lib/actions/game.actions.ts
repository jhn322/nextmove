"use server";

import { Chess } from "chess.js";
import { type Bot } from "@/components/game/data/bots";
import {
  saveGameResult,
  type GameHistory,
  getUserGameStats,
} from "@/lib/game-service";
import { clearUserGameHistory } from "@/lib/game-service";
import prisma from "@/lib/prisma";
import { calculateNewElo } from "@/lib/elo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { type GameStats } from "@/types/stats";

const DEFAULT_START_ELO = 600; // Fallback, though Prisma schema default should handle new users

// Interface for the parameters of saveGameAction, mirroring SaveGameResultParams
// but ensuring serializability for server action arguments.
// ChessInstance cannot be directly passed, so we'll pass FEN and reconstruct.
interface SaveGameActionParams {
  userId: string;
  fen: string; // FEN string instead of Chess instance
  pgnHistory?: string[];
  difficulty: string;
  playerColor: "w" | "b";
  selectedBot: Bot | null; // Ensure Bot is serializable or pass only necessary ID/name
  gameTime: number;
  movesCount: number;
  isResignation?: boolean;
}

interface SaveGameResultWithElo extends GameHistory {
  eloDelta: number;
  newElo: number;
}

export const saveGameAction = async ({
  userId,
  fen,
  difficulty,
  playerColor,
  selectedBot,
  gameTime,
  movesCount,
  isResignation,
}: SaveGameActionParams): Promise<SaveGameResultWithElo | null> => {
  if (!userId || !selectedBot) {
    console.error("saveGameAction: Missing userId or selectedBot");
    return null;
  }

  const serverGame = new Chess();
  serverGame.load(fen);

  let actualGameResult: "win" | "loss" | "draw" | "resign";

  if (isResignation) {
    actualGameResult = "resign";
  } else if (serverGame.isCheckmate()) {
    const winningColor = serverGame.turn() === "w" ? "b" : "w";
    actualGameResult = winningColor === playerColor ? "win" : "loss";
  } else if (serverGame.isDraw()) {
    actualGameResult = "draw";
  } else {
    console.warn("saveGameAction: Game is not over but action was called.");
    return null;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`saveGameAction: User with id ${userId} not found.`);
      return null;
    }

    let eloDelta = 0;
    let newElo = user.elo ?? DEFAULT_START_ELO;

    // Calculate ELO only for wins or losses (including resignations as losses)
    if (
      actualGameResult === "win" ||
      actualGameResult === "loss" ||
      actualGameResult === "resign"
    ) {
      const gameResultForElo: 1 | 0 = actualGameResult === "win" ? 1 : 0;
      const eloCalculation = calculateNewElo(
        user.elo ?? DEFAULT_START_ELO, // Ensure we pass a number or null/undefined
        selectedBot.rating,
        gameResultForElo
      );
      eloDelta = eloCalculation.eloDelta;
      newElo = eloCalculation.newElo;

      await prisma.user.update({
        where: { id: userId },
        data: { elo: newElo },
      });
    }

    // Save the game outcome to the Game model (this determines result string "win", "loss", etc.)
    const savedGame = await saveGameResult({
      userId,
      game: serverGame, // Pass the loaded Chess instance
      difficulty,
      playerColor,
      selectedBot,
      gameTime,
      movesCount,
      isResignation: actualGameResult === "resign",
      eloDelta,
      newElo,
    });

    if (!savedGame) {
      console.error("saveGameAction: Failed to save game result via service.");
      return null;
    }

    return {
      ...savedGame,
      eloDelta,
      newElo,
    };
  } catch (error) {
    console.error("Error in saveGameAction:", error);
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

export const getUserGameStatsAction = async (): Promise<{
  gameStats?: GameStats | null;
  error?: string;
}> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "User not authenticated." };
    }

    const gameStats = await getUserGameStats(session.user.id);
    return { gameStats };
  } catch (error) {
    console.error("Error in getUserGameStatsAction:", error);
    return { error: "Failed to fetch game statistics." };
  }
};
