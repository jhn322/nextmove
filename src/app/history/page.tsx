import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { getUserGameHistory, type GameHistory } from "@/lib/game-service";
import { BOTS_BY_DIFFICULTY, Bot } from "@/components/game/data/bots";
import { HistoryPageClient } from "./history-page-client";
import React from "react";
import { redirect } from "next/navigation";
import { type GameStats } from "@/types/stats";
import { Metadata } from "next";

const calculateGameStats = (history: GameHistory[]): GameStats | null => {
  if (!history || history.length === 0) {
    return null;
  }

  const wins = history.filter((game) => game.result === "win").length;
  const losses = history.filter((game) => game.result === "loss").length;
  const draws = history.filter((game) => game.result === "draw").length;
  const stalemates = history.filter(
    (game) => game.result === "stalemate"
  ).length;
  const resigns = history.filter((game) => game.result === "resign").length;
  const totalGames = history.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  const totalMoves = history.reduce((sum, game) => sum + game.movesCount, 0);
  const averageMovesPerGame = totalGames > 0 ? totalMoves / totalGames : 0;

  const totalTime = history.reduce((sum, game) => sum + game.timeTaken, 0);
  const averageGameTime = totalGames > 0 ? totalTime / totalGames : 0;

  const beatenBots: Array<{ name: string; difficulty: string; id: number }> =
    [];
  history.forEach((game) => {
    if (game.result === "win") {
      const botName = game.opponent;
      const difficulty = game.difficulty;

      const botInDifficulty = BOTS_BY_DIFFICULTY[
        difficulty as keyof typeof BOTS_BY_DIFFICULTY
      ]?.find((bot: Bot) => bot.name === botName);

      const existingBot = beatenBots.find((bot) => bot.name === botName);

      if (!existingBot) {
        beatenBots.push({
          name: botName,
          difficulty,
          id: botInDifficulty?.id || 0, // Default to 0 if bot not found
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
};

export default async function HistoryPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // Redirect to login page if not authenticated
    redirect("/auth/login?callbackUrl=/history");
  }

  let initialGameHistory: GameHistory[] = [];
  let initialGameStats: GameStats | null = null;
  let initialError: string | undefined = undefined;
  let serverMessage: string | undefined = undefined;

  try {
    initialGameHistory = (await getUserGameHistory(session.user.id)) || [];
    initialGameStats = calculateGameStats(initialGameHistory);
    if (initialGameHistory.length === 0) {
      serverMessage = "No games found in your history";
    }
  } catch (error: unknown) {
    console.error("Error fetching game history on server:", error);
    initialError =
      "An unexpected error occurred fetching history. Please try refreshing the page.";
    // Avoid passing detailed Prisma/auth errors to the client for security
  }

  // Render the client component with the fetched data
  return (
    <HistoryPageClient
      session={session}
      initialGameHistory={initialGameHistory}
      initialGameStats={initialGameStats}
      initialError={initialError}
      serverMessage={serverMessage}
    />
  );
}

export const generateMetadata = async (): Promise<Metadata> => ({
  title: "History | NextMove",
});
