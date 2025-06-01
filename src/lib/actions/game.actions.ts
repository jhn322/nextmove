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
  isResignation = false,
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
      prestigeLevel: user.prestigeLevel ?? 0, // Include current prestige level
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

export const resetUserProgressAction = async (
  userId: string
): Promise<boolean> => {
  if (!userId) {
    console.error("resetUserProgressAction: Missing userId");
    return false;
  }
  try {
    // Wrap operations in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Delete all chess game history
      await tx.game.deleteMany({
        where: { userId: userId },
      });

      // Reset user's ELO back to default starting value
      await tx.user.update({
        where: { id: userId },
        data: { elo: DEFAULT_START_ELO },
      });
    });

    return true;
  } catch (error) {
    console.error("Error in resetUserProgressAction:", error);
    return false;
  }
};

export const resetUserWordleStatsAction = async (
  userId: string
): Promise<boolean> => {
  if (!userId) {
    console.error("resetUserWordleStatsAction: Missing userId");
    return false;
  }
  try {
    // Delete all Wordle attempt records for the user
    await prisma.wordleAttempt.deleteMany({
      where: { userId: userId },
    });

    return true;
  } catch (error) {
    console.error("Error in resetUserWordleStatsAction:", error);
    return false;
  }
};

export const prestigeUserAction = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error("prestigeUserAction: Missing userId");
    return false;
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        prestigeLevel: { increment: 1 },
      },
    });

    return true;
  } catch (error) {
    console.error("Error in prestigeUserAction:", error);
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

// Development action to add wins against 47 bots for testing
export const addTestWinsAction = async (): Promise<boolean> => {
  if (process.env.NODE_ENV !== "development") {
    console.error("addTestWinsAction: Only available in development mode");
    return false;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("addTestWinsAction: User not authenticated");
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { prestigeLevel: true },
    });

    if (!user) {
      console.error("addTestWinsAction: User not found");
      return false;
    }

    const currentPrestigeLevel = user.prestigeLevel ?? 0;

    // Get all bots except the first beginner bot
    const { BOTS_BY_DIFFICULTY } = await import("@/components/game/data/bots");
    const allBots: Array<{ name: string; difficulty: string; id: number }> = [];

    Object.keys(BOTS_BY_DIFFICULTY).forEach((difficulty) => {
      BOTS_BY_DIFFICULTY[difficulty as keyof typeof BOTS_BY_DIFFICULTY].forEach(
        (bot) => {
          allBots.push({
            name: bot.name,
            difficulty,
            id: bot.id,
          });
        }
      );
    });

    // Skip the first bot (should be the first beginner bot)
    const botsToWin = allBots.slice(1);

    // Create game records for wins against these bots
    const gamePromises = botsToWin.map((bot, index) => {
      return prisma.game.create({
        data: {
          userId: session.user.id,
          opponent: bot.name,
          result: "win",
          difficulty: bot.difficulty,
          movesCount: 30 + Math.floor(Math.random() * 20), // Random moves 30-50
          timeTaken: 300 + Math.floor(Math.random() * 600), // Random time 5-15 minutes
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Starting position
          prestigeLevel: currentPrestigeLevel,
          eloDelta: 10 + Math.floor(Math.random() * 10), // Random ELO gain 10-20
          newElo: 600 + index * 5, // Progressive ELO
        },
      });
    });

    await Promise.all(gamePromises);

    console.log(
      `addTestWinsAction: Added ${botsToWin.length} test wins for user ${session.user.id}`
    );
    return true;
  } catch (error) {
    console.error("Error in addTestWinsAction:", error);
    return false;
  }
};
