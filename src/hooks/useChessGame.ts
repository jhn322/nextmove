import { useState, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
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

  // State for pawn promotion
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Check if a move is a pawn promotion
  const isPawnPromotion = useCallback(
    (from: string, to: string): boolean => {
      const piece = game.get(from as Square);
      if (!piece || piece.type !== "p") return false;

      const targetRank = to.charAt(1);

      // Check if pawn is moving to the last rank
      return (
        (piece.color === "w" && targetRank === "8") ||
        (piece.color === "b" && targetRank === "1")
      );
    },
    [game]
  );

  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedState = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "null"
        ) as SavedGameState | null;

        if (savedState && savedState.fen) {
          game.load(savedState.fen);
          setBoard(game.board());

          // Check if there's gameplay in progress
          const hasMovesBeenMade =
            savedState.lastMove !== null ||
            (savedState.history && savedState.history.length > 1);

          // Only consider it a started game if there are actual moves made
          const isStartedGame =
            savedState.fen !== DEFAULT_STATE.fen && hasMovesBeenMade;
          setGameStarted(savedState.gameStarted || isStartedGame);

          setPlayerColor(savedState.playerColor || "w");
          setHistory(
            savedState.history || [
              { fen: savedState.fen, lastMove: savedState.lastMove },
            ]
          );
          setCurrentMove(savedState.currentMove || 1);
          setLastMove(savedState.lastMove || null);
          setCapturedPieces(savedState.capturedPieces || []);
        }
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    };

    loadSavedState();
  }, [game, difficulty]);

  // Hook for playing sounds
  const { playSound } = useGameSounds();

  // Make a move and update the board
  const makeMove = useCallback(
    (from: string, to: string, promotionPiece?: "q" | "r" | "n" | "b") => {
      try {
        // Check if this is a pawn promotion move
        if (!promotionPiece && isPawnPromotion(from, to)) {
          setPendingPromotion({ from, to });
          return false;
        }

        setPendingPromotion(null);

        // Check if the move is legal before attempting it
        const moves = game.moves({ verbose: true });
        const isLegalMove = moves.some(
          (move) => move.from === from && move.to === to
        );

        if (!isLegalMove) {
          playSound("illegal");
          return false;
        }

        const moveDetails = game.move({
          from,
          to,
          promotion: promotionPiece || "q",
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
          } else if (moveDetails.san.includes("=")) {
            playSound("move-self");
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
            // Use a safer approach for checkmate sound
            setTimeout(() => {
              try {
                playSound("game-end");
                console.log("Checkmate detected, playing game-end sound");
              } catch (err) {
                console.error("Failed to play checkmate sound:", err);
              }
            }, 300); // Slightly longer delay for checkmate sound
          }
          if (game.isDraw()) {
            setTimeout(() => playSound("game-draw"), 200);
          }

          return true;
        }
        return false;
      } catch (error) {
        // This catch block should now rarely be hit since we check for legal moves first
        console.debug("Move handling error:", error);
        playSound("illegal");
        return false;
      }
    },
    [game, playSound, playerColor, isPawnPromotion]
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
    pendingPromotion,
    setPendingPromotion,
  };
};
