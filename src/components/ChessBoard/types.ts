export type HistoryEntry = {
  fen: string;
  lastMove: { from: string; to: string } | null;
};

export type StockfishEngine = Worker;

export type SavedGameState = {
  fen: string;
  playerColor: "w" | "b";
  gameTime: number;
  whiteTime: number;
  blackTime: number;
  difficulty: string;
  gameStarted: boolean;
  history: HistoryEntry[];
  currentMove: number;
  lastMove: { from: string; to: string } | null;
};
