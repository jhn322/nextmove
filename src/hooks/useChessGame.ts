import { useState, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { STORAGE_KEY, DEFAULT_STATE } from "../config/game";
import { useGameSounds } from "./useGameSounds";
import type { HistoryEntry, SavedGameState } from "../types/types";
import { CapturedPiece } from "@/lib/calculateMaterialAdvantage";

export const useChessGame = (difficulty: string) => {
  // Initialize with default state
  const defaultState = {
    ...DEFAULT_STATE,
    difficulty,
    history: [{ fen: DEFAULT_STATE.fen, lastMove: null }],
    currentMove: 1,
    lastMove: null,
    capturedPieces: [],
  };

  const [history, setHistory] = useState<HistoryEntry[]>(defaultState.history);
  const [currentMove, setCurrentMove] = useState(defaultState.currentMove);
  const [game] = useState(() => {
    const chess = new Chess();
    chess.load(defaultState.fen);
    return chess;
  });
  const [board, setBoard] = useState(game.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    defaultState.lastMove
  );
  const [gameStarted, setGameStarted] = useState(defaultState.gameStarted);
  const [playerColor, setPlayerColor] = useState<"w" | "b">(
    defaultState.playerColor
  );
  const [capturedPieces, setCapturedPieces] = useState<CapturedPiece[]>(
    defaultState.capturedPieces
  );

  // Load saved state from localStorage after component mounts
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadSavedState = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const state = JSON.parse(saved) as SavedGameState;
          if (state.difficulty === difficulty) {
            const initialHistory = [{ fen: DEFAULT_STATE.fen, lastMove: null }];

            // Update state with saved values
            if (state.fen) {
              game.load(state.fen);
              setBoard(game.board());
            }

            setHistory(
              Array.isArray(state.history) ? state.history : initialHistory
            );

            setCurrentMove(state.currentMove || 1);
            setLastMove(state.lastMove || null);
            setGameStarted(state.gameStarted || false);
            setPlayerColor(state.playerColor || "w");
            setCapturedPieces(state.capturedPieces || []);
          }
        }
      } catch (error) {
        console.error("Error loading saved game state:", error);
      }
    };

    loadSavedState();
  }, [difficulty, game]);

  // Hook for playing sounds
  const { playSound } = useGameSounds();

  // Make a move and update the board
  const makeMove = useCallback(
    (from: string, to: string) => {
      try {
        const moveDetails = game.move({
          from,
          to,
          promotion: "q",
        });

        if (moveDetails) {
          setBoard(game.board());
          setHistory((prev) => [
            ...prev,
            { fen: game.fen(), lastMove: { from, to } },
          ]);
          setCurrentMove((prev) => prev + 1);
          setLastMove({ from, to });

          // Track captured pieces
          if (moveDetails.captured) {
            const capturedPiece: CapturedPiece = {
              type: moveDetails.captured,
              color: moveDetails.color === "w" ? "b" : "w",
            };
            setCapturedPieces((prev) => [...prev, capturedPiece]);
          }

          // Play appropriate sound based on move type and who's moving
          if (moveDetails.captured) {
            playSound("capture");
          } else if (moveDetails.san.includes("O-O")) {
            playSound("castle");
          } else {
            // Different sounds for player and bot moves
            playSound(
              game.turn() === playerColor ? "move-opponent" : "move-self"
            );
          }

          // Check for special game states
          if (game.isCheck()) {
            setTimeout(() => playSound("check"), 100);
          }
          if (game.isCheckmate()) {
            setTimeout(() => playSound("game-end"), 200);
          }
          if (game.isDraw()) {
            setTimeout(() => playSound("game-draw"), 200);
          }

          return true;
        }
      } catch {
        playSound("illegal");
        console.log("Invalid move");
      }
      return false;
    },
    [game, playSound, playerColor]
  );

  // Move back to the previous position in history
  const moveBack = useCallback(() => {
    if (currentMove > 1 && history[currentMove - 2]) {
      const newPosition = currentMove - 1;
      const historyEntry = history[newPosition - 1];

      if (historyEntry && historyEntry.fen) {
        game.load(historyEntry.fen);
        setBoard(game.board());
        setCurrentMove(newPosition);
        setLastMove(historyEntry.lastMove);
      }
    }
  }, [currentMove, game, history]);

  // Move forward to the next position in history
  const moveForward = useCallback(() => {
    if (currentMove < history.length && history[currentMove]) {
      const historyEntry = history[currentMove];

      if (historyEntry && historyEntry.fen) {
        game.load(historyEntry.fen);
        setBoard(game.board());
        setCurrentMove(currentMove + 1);
        setLastMove(historyEntry.lastMove);
      }
    }
  }, [currentMove, game, history]);

  // Reset captured pieces
  const resetCapturedPieces = useCallback(() => {
    setCapturedPieces([]);
  }, []);

  return {
    game,
    board,
    setBoard,
    history,
    setHistory,
    currentMove,
    setCurrentMove,
    lastMove,
    setLastMove,
    gameStarted,
    setGameStarted,
    makeMove,
    moveBack,
    moveForward,
    playerColor,
    setPlayerColor,
    capturedPieces,
    setCapturedPieces,
    resetCapturedPieces,
  };
};
