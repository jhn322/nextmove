import { Chess } from "chess.js";
import { Bot, BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { DIFFICULTY_LEVELS } from "@/config/game";
import prisma from "./prisma";
import type { Game as PrismaGame } from "@/generated/prisma";

export type GameHistory = PrismaGame;

interface SaveGameResultParams {
  userId: string;
  game: Chess;
  difficulty: string;
  playerColor: "w" | "b";
  selectedBot: Bot | null;
  gameTime: number;
  movesCount: number;
  isResignation?: boolean;
  eloDelta?: number;
  newElo?: number;
}

/**
 * Determines the game result from the player's perspective
 */
export const determineGameResult = (
  game: Chess,
  playerColor: "w" | "b",
  isResignation?: boolean
): "win" | "loss" | "draw" | "resign" => {
  if (isResignation) {
    return "resign";
  }

  if (game.isDraw()) {
    return "draw";
  }

  if (game.isCheckmate()) {
    const losingColor = game.turn();
    const winningColor = losingColor === "w" ? "b" : "w";
    const result = winningColor === playerColor ? "win" : "loss";
    return result;
  }

  // Default case (should not happen)
  return "draw";
};

/**
 * Normalize difficulty to ensure it matches one of the valid difficulty levels
 */
const normalizeDifficulty = (difficulty: string): string => {
  // Convert to lowercase for case-insensitive comparison
  const normalizedDifficulty = difficulty.toLowerCase();

  // Check if the difficulty is one of the valid keys in DIFFICULTY_LEVELS
  if (Object.keys(DIFFICULTY_LEVELS).includes(normalizedDifficulty)) {
    return normalizedDifficulty;
  }

  // Map "medium" to "intermediate" for backward compatibility
  if (normalizedDifficulty === "medium") {
    return "intermediate";
  }

  // Default to "intermediate" if not recognized
  return "intermediate";
};

/**
 * Saves a game result to the database using Prisma
 */
export const saveGameResult = async ({
  userId,
  game,
  difficulty,
  playerColor,
  selectedBot,
  gameTime,
  movesCount,
  isResignation = false,
  eloDelta,
  newElo,
}: SaveGameResultParams): Promise<GameHistory | null> => {
  try {
    if (!userId || !selectedBot) {
      console.error("Missing required parameters to save game result");
      return null;
    }

    const result = determineGameResult(game, playerColor, isResignation);
    const normalizedDifficulty = normalizeDifficulty(difficulty);

    const savedGame = await prisma.game.create({
      data: {
        userId: userId,
        opponent: selectedBot.name,
        result: result,
        difficulty: normalizedDifficulty,
        movesCount: movesCount,
        timeTaken: gameTime,
        fen: game.fen(),
        eloDelta: eloDelta,
        newElo: newElo,
      },
    });

    return savedGame;
  } catch (error) {
    console.error("Unexpected error saving game result:", error);
    return null;
  }
};

/**
 * Gets all game history for a user using Prisma
 */
export const getUserGameHistory = async (
  userId: string
): Promise<GameHistory[]> => {
  try {
    if (!userId) {
      console.error("Missing user ID to fetch game history");
      throw new Error("Authentication required or User ID missing");
    }

    const gameHistory = await prisma.game.findMany({
      where: { userId: userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return gameHistory.map((game) => ({
      ...game,
      difficulty: normalizeDifficulty(game.difficulty),
      eloDelta: game.eloDelta,
      newElo: game.newElo,
    }));
  } catch (error) {
    console.error("Unexpected error fetching game history:", error);
    throw error;
  }
};

/**
 * Gets statistics about a user's game history using Prisma
 */
export const getUserGameStats = async (userId: string) => {
  try {
    if (!userId) {
      console.error("Missing user ID to fetch game stats");
      throw new Error("Authentication required or User ID missing");
    }

    const gameHistory = await getUserGameHistory(userId);

    if (gameHistory.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        stalemates: 0,
        resigns: 0,
        winRate: 0,
        averageMovesPerGame: 0,
        averageGameTime: 0,
        beatenBots: [] as Array<{
          name: string;
          difficulty: string;
          id: number;
        }>,
      };
    }

    const wins = gameHistory.filter((game) => game.result === "win").length;
    const losses = gameHistory.filter((game) => game.result === "loss").length;
    const draws = gameHistory.filter((game) => game.result === "draw").length;
    const stalemates = gameHistory.filter(
      (game) => game.result === "stalemate"
    ).length;
    const resigns = gameHistory.filter(
      (game) => game.result === "resign"
    ).length;
    const totalGames = gameHistory.length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    const totalMoves = gameHistory.reduce(
      (sum, game) => sum + game.movesCount,
      0
    );
    const averageMovesPerGame = totalGames > 0 ? totalMoves / totalGames : 0;

    const totalTime = gameHistory.reduce(
      (sum, game) => sum + game.timeTaken,
      0
    );
    const averageGameTime = totalGames > 0 ? totalTime / totalGames : 0;

    // Calculate beatenBots: unique bots defeated (by name)
    const beatenBots: Array<{ name: string; difficulty: string; id: number }> =
      [];
    gameHistory.forEach((game) => {
      if (game.result === "win") {
        const botName = game.opponent;
        const difficulty = normalizeDifficulty(game.difficulty);
        const botInDifficulty = BOTS_BY_DIFFICULTY[
          difficulty as keyof typeof BOTS_BY_DIFFICULTY
        ]?.find((bot) => bot.name === botName);
        const existingBot = beatenBots.find((bot) => bot.name === botName);
        if (!existingBot) {
          beatenBots.push({
            name: botName,
            difficulty,
            id: botInDifficulty?.id || 0,
          });
        }
      }
    });

    return {
      totalGames,
      wins,
      losses,
      draws,
      stalemates,
      resigns,
      winRate,
      averageMovesPerGame,
      averageGameTime,
      beatenBots,
    };
  } catch (error) {
    console.error("Error calculating game stats:", error);
    throw error;
  }
};

/**
 * Clears chess game history for a user using Prisma (does not affect Wordle stats)
 */
export const clearUserGameHistory = async (
  userId: string
): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Missing user ID to clear game history");
      return false;
    }

    // Delete chess game history only
    await prisma.game.deleteMany({
      where: { userId: userId },
    });

    return true;
  } catch (error) {
    console.error("Unexpected error clearing chess game history:", error);
    return false;
  }
};
