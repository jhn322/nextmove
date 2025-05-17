export interface UserWordleStats {
  totalPlays: number;
  totalWins: number;
  currentStreak: number;
  longestStreak: number;
  guessDistribution: Record<number, number>;
  averageGuessesInWonGames: number | null;
  winPercentage: number;
}
