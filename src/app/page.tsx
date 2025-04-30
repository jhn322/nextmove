import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { HomePageClient } from "./home-page-client"; // Import the new client component
import { getUserGameStats } from "@/lib/game-service";
import { BOTS_BY_DIFFICULTY, Bot } from "@/components/game/data/bots";

interface GameStats {
  beatenBots: Array<{ name: string; difficulty: string }>;
  totalGames: number;
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  let gameStats: GameStats | null = null;
  let nextBot: (Bot & { difficulty: string }) | null = null;
  let allBotsBeaten = false;

  if (session?.user?.id) {
    try {
      gameStats = await getUserGameStats(session.user.id);

      // Get all bots in order of difficulty
      const allBots: Array<Bot & { difficulty: string }> = [];
      Object.keys(BOTS_BY_DIFFICULTY).forEach((difficulty) => {
        BOTS_BY_DIFFICULTY[
          difficulty as keyof typeof BOTS_BY_DIFFICULTY
        ].forEach((bot) => {
          allBots.push({ ...bot, difficulty });
        });
      });

      // Find the first unbeaten bot
      const nextUnbeatenBot = allBots.find(
        (bot) =>
          !gameStats?.beatenBots.some((beaten) => beaten.name === bot.name)
      );

      if (nextUnbeatenBot) {
        nextBot = nextUnbeatenBot;
        allBotsBeaten = false;
      } else if (gameStats?.beatenBots.length === allBots.length) {
        // Check if all bots are beaten
        nextBot = null;
        allBotsBeaten = true;
      }
    } catch (error) {
      console.error("Error fetching game stats on server:", error);
      // Handle error appropriately, maybe pass an error state to the client
      gameStats = null;
      nextBot = null;
      allBotsBeaten = false;
    }
  }

  return (
    <HomePageClient
      session={session}
      gameStats={gameStats}
      nextBot={nextBot}
      allBotsBeaten={allBotsBeaten}
    />
  );
}
