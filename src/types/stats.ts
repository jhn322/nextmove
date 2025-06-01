// **  GameStats Interface  ** //
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  stalemates: number; // Number of stalemate games
  resigns: number; // Number of games resigned by the user
  winRate: number; // Percentage, 0-100
  averageMovesPerGame: number;
  averageGameTime: number; // In seconds
  beatenBots: Array<{
    name: string;
    difficulty: string;
    id: number; // Bot ID
  }>;
  prestigeLevel: number; // Current prestige level
}
