import { Chess } from "chess.js";
import { SavedGameState } from "../types/types";

export const STORAGE_KEY = "chess-game-state";

export const DEFAULT_STATE: SavedGameState = {
  fen: new Chess().fen(),
  playerColor: "w" as "w" | "b",
  gameTime: 0,
  whiteTime: 0,
  blackTime: 0,
  difficulty: "beginner",
  gameStarted: false,
  history: [{ fen: new Chess().fen(), lastMove: null }],
  currentMove: 1,
  lastMove: null,
};

export const DIFFICULTY_LEVELS = {
  beginner: 1,
  easy: 3,
  intermediate: 6,
  advanced: 9,
  hard: 13,
  expert: 16,
  master: 19,
  grandmaster: 23,
} as const;
