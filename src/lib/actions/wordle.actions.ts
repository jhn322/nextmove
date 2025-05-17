"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { type UserWordleStats } from "@/types/wordle";

interface GetUserWordleStatsResult {
  stats?: UserWordleStats;
  error?: string;
}

export async function getUserWordleStatsAction(): Promise<GetUserWordleStatsResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "User not authenticated." };
    }

    const userId = session.user.id;

    const attempts = await prisma.wordleAttempt.findMany({
      where: { userId },
      orderBy: { playedAt: "asc" }, // Ascending to correctly calculate streaks
    });

    if (attempts.length === 0) {
      return {
        stats: {
          totalPlays: 0,
          totalWins: 0,
          currentStreak: 0,
          longestStreak: 0,
          guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          averageGuessesInWonGames: null,
          winPercentage: 0,
        },
      };
    }

    const totalPlays = attempts.length;
    const winningAttempts = attempts.filter((attempt) => attempt.isWin);
    const totalWins = winningAttempts.length;

    const guessDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
    let totalGuessesInWonGames = 0;

    for (const attempt of winningAttempts) {
      if (attempt.guessesTaken >= 1 && attempt.guessesTaken <= 6) {
        guessDistribution[attempt.guessesTaken] =
          (guessDistribution[attempt.guessesTaken] || 0) + 1;
      }
      totalGuessesInWonGames += attempt.guessesTaken;
    }

    const averageGuessesInWonGames =
      totalWins > 0 ? totalGuessesInWonGames / totalWins : null;

    const winPercentage = totalPlays > 0 ? (totalWins / totalPlays) * 100 : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let currentTempStreak = 0;

    // Calculate current streak (iterating backwards from most recent)
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].isWin) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak (iterating forwards)
    for (const attempt of attempts) {
      if (attempt.isWin) {
        currentTempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentTempStreak);
        currentTempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, currentTempStreak);
    return {
      stats: {
        totalPlays,
        totalWins,
        currentStreak,
        longestStreak,
        guessDistribution,
        averageGuessesInWonGames,
        winPercentage,
      },
    };
  } catch (error) {
    console.error("[ACTION_GET_WORDLE_STATS] Error:", error);
    return {
      error: "Failed to fetch Wordle statistics. Please try again later.",
    };
  }
}
