import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import {
  getUserGameHistory,
  getUserGameStats,
  type GameHistory,
} from "@/lib/game-service";
import { BOTS_BY_DIFFICULTY, Bot } from "@/components/game/data/bots";
import { HistoryPageClient } from "./history-page-client";
import React from "react";
import { redirect } from "next/navigation";
import { type GameStats } from "@/types/stats";
import { Metadata } from "next";

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
    initialGameStats = await getUserGameStats(session.user.id);
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
