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
  beginner: {
    skillLevel: 1,
    depth: 1,
    moveTime: 100,
  },
  easy: {
    skillLevel: 3,
    depth: 2,
    moveTime: 200,
  },
  intermediate: {
    skillLevel: 6,
    depth: 3,
    moveTime: 400,
  },
  advanced: {
    skillLevel: 9,
    depth: 4,
    moveTime: 600,
  },
  hard: {
    skillLevel: 13,
    depth: 5,
    moveTime: 800,
  },
  expert: {
    skillLevel: 16,
    depth: 6,
    moveTime: 1000,
  },
  master: {
    skillLevel: 19,
    depth: 8,
    moveTime: 1200,
  },
  grandmaster: {
    skillLevel: 23,
    depth: 10,
    moveTime: 1500,
  },
} as const;
