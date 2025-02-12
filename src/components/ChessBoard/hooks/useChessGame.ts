import { useState, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { STORAGE_KEY, DEFAULT_STATE } from "../constants";
import type { HistoryEntry, SavedGameState } from "../types";

export const useChessGame = (difficulty: string) => {
  // Load initial state from localStorage or use defaults
  const loadSavedState = (): SavedGameState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as SavedGameState;
      if (state.difficulty === difficulty) {
        const initialHistory = [{ fen: DEFAULT_STATE.fen, lastMove: null }];
        return {
          ...state,
          history: Array.isArray(state.history)
            ? state.history
            : initialHistory,
          currentMove: state.currentMove || 1,
          lastMove: state.lastMove || null,
        };
      }
    }
    return {
      ...DEFAULT_STATE,
      difficulty,
      history: [{ fen: DEFAULT_STATE.fen, lastMove: null }],
      currentMove: 1,
      lastMove: null,
    };
  };

  const savedState = loadSavedState();
  const [history, setHistory] = useState<HistoryEntry[]>(savedState.history);
  const [currentMove, setCurrentMove] = useState(savedState.currentMove);
  const [game] = useState(() => {
    const chess = new Chess();
    chess.load(savedState.fen);
    return chess;
  });
  const [board, setBoard] = useState(game.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    savedState.lastMove
  );
  const [gameStarted, setGameStarted] = useState(savedState.gameStarted);
  const [playerColor, setPlayerColor] = useState<"w" | "b">(
    savedState.playerColor
  );

  // Make a move and update the board
  const makeMove = useCallback(
    (from: string, to: string) => {
      try {
        const move = game.move({
          from,
          to,
          promotion: "q",
        });

        if (move) {
          setBoard(game.board());
          setHistory((prev) => [
            ...prev,
            { fen: game.fen(), lastMove: { from, to } },
          ]);
          setCurrentMove((prev: number) => prev + 1);
          setLastMove({ from, to });
          return true;
        }
      } catch {
        console.log("Invalid move");
      }
      return false;
    },
    [game]
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
  };
};
