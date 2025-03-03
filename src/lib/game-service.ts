import { GameHistory, getAuthenticatedSupabaseClient } from "@/lib/supabase";
import { Chess } from "chess.js";
import { Bot } from "@/components/game/data/bots";
import { Session } from "next-auth";
import { DIFFICULTY_LEVELS } from "@/config/game";

interface SaveGameResultParams {
  userId: string;
  game: Chess;
  difficulty: string;
  playerColor: "w" | "b";
  selectedBot: Bot | null;
  gameTime: number;
  movesCount: number;
  isResignation?: boolean;
  session: Session | null;
}

/**
 * Determines the game result from the player's perspective
 */
export const determineGameResult = (
  game: Chess,
  playerColor: "w" | "b",
  isResignation?: boolean
): "win" | "loss" | "draw" => {
  if (isResignation) {
    return "loss";
  }

  if (game.isDraw()) {
    return "draw";
  }

  if (game.isCheckmate()) {
    const losingColor = game.turn();
    const winningColor = losingColor === "w" ? "b" : "w";
    return winningColor === playerColor ? "win" : "loss";
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
 * Saves a game result to the database
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
  session,
}: SaveGameResultParams): Promise<GameHistory | null> => {
  try {
    if (!userId || !selectedBot) {
      console.error("Missing required parameters to save game result");
      return null;
    }

    // Use the authenticated client
    const client = getAuthenticatedSupabaseClient(session);

    // First, check if this exact game result has already been saved
    // We use the game FEN as a unique identifier for the game state
    const { data: existingGames, error: checkError } = await client
      .from("game_history")
      .select("id")
      .filter("user_id", "eq", userId)
      .filter("fen", "eq", game.fen())
      .limit(1);

    if (checkError) {
      console.error("Error checking for existing game:", checkError);
    } else if (existingGames && existingGames.length > 0) {
      console.log("Game already exists in database, skipping save");
      return existingGames[0] as GameHistory;
    }

    const result = determineGameResult(game, playerColor, isResignation);

    // Normalize the difficulty to ensure it's a valid value
    const normalizedDifficulty = normalizeDifficulty(difficulty);

    const gameData: Omit<GameHistory, "id"> = {
      user_id: userId,
      opponent: selectedBot.name,
      result,
      date: new Date().toISOString(),
      moves_count: movesCount,
      time_taken: gameTime,
      difficulty: normalizedDifficulty,
      fen: game.fen(), // Store the FEN to help prevent duplicate saves
    };

    const { data, error } = await client
      .from("game_history")
      .insert(gameData)
      .select()
      .single();

    if (error) {
      console.error("Error saving game result:", error);
      return null;
    }

    return data as GameHistory;
  } catch (error) {
    console.error("Unexpected error saving game result:", error);
    return null;
  }
};

/**
 * Gets all game history for a user
 */
export const getUserGameHistory = async (
  userId: string,
  session: Session | null
): Promise<GameHistory[]> => {
  try {
    if (!userId || !session) {
      console.error("Missing required parameters to fetch game history");
      throw new Error("Authentication required");
    }

    // Use the authenticated client
    const client = getAuthenticatedSupabaseClient(session);

    const { data, error } = await client
      .from("game_history")
      .select("*")
      .filter("user_id", "eq", userId)
      .order("date", { ascending: false });

    if (error) {
      // Check if this is an authentication error
      if (
        error.code === "401" ||
        error.message.includes("auth") ||
        error.message.includes("permission")
      ) {
        console.error("Authentication error fetching game history:", error);
        throw new Error("Authentication error: " + error.message);
      }

      console.error("Error fetching game history:", error);
      return [];
    }

    // Normalize difficulty values in the retrieved data
    const normalizedData = data.map((game: GameHistory) => ({
      ...game,
      difficulty: normalizeDifficulty(game.difficulty),
    }));

    return normalizedData as GameHistory[];
  } catch (error) {
    console.error("Unexpected error fetching game history:", error);
    throw error;
  }
};

/**
 * Gets statistics about a user's game history
 */
export const getUserGameStats = async (
  userId: string,
  session: Session | null
) => {
  try {
    if (!userId || !session) {
      console.error("Missing required parameters to fetch game stats");
      throw new Error("Authentication required");
    }

    const gameHistory = await getUserGameHistory(userId, session);

    if (gameHistory.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        averageMovesPerGame: 0,
        averageGameTime: 0,
        beatenBots: [],
      };
    }

    // Calculate statistics
    const wins = gameHistory.filter((game) => game.result === "win").length;
    const losses = gameHistory.filter((game) => game.result === "loss").length;
    const draws = gameHistory.filter((game) => game.result === "draw").length;
    const totalGames = gameHistory.length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    const totalMoves = gameHistory.reduce(
      (sum, game) => sum + game.moves_count,
      0
    );
    const averageMovesPerGame = totalGames > 0 ? totalMoves / totalGames : 0;

    const totalTime = gameHistory.reduce(
      (sum, game) => sum + game.time_taken,
      0
    );
    const averageGameTime = totalGames > 0 ? totalTime / totalGames : 0;

    // Get list of bots the player has beaten
    const beatenBots = Array.from(
      new Set(
        gameHistory
          .filter((game) => game.result === "win")
          .map((game) => ({
            name: game.opponent,
            difficulty: normalizeDifficulty(game.difficulty),
          }))
      )
    );

    return {
      totalGames,
      wins,
      losses,
      draws,
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

export const clearUserGameHistory = async (
  userId: string,
  session: Session | null
): Promise<boolean> => {
  try {
    if (!userId || !session) {
      console.error("Missing required parameters to clear game history");
      return false;
    }

    // Use the authenticated client
    const client = getAuthenticatedSupabaseClient(session);

    // Delete all game history records for this user
    const { error } = await client
      .from("game_history")
      .delete()
      .filter("user_id", "eq", userId);

    if (error) {
      console.error("Error clearing game history:", error);
      return false;
    }

    // Clear all game-related data from localStorage
    if (typeof window !== "undefined") {
      // Clear game result tracking
      localStorage.removeItem("last-saved-game-id");
      localStorage.removeItem("last-saved-game-fen");

      // Clear any cached game history data
      localStorage.removeItem("chess-game-history");
      localStorage.removeItem("chess-game-stats");

      // Clear any other game-related data that might be cached
      localStorage.removeItem("chess-last-game-result");
    }

    return true;
  } catch (error) {
    console.error("Unexpected error clearing game history:", error);
    return false;
  }
};
