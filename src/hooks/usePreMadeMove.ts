import { useState, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
import type { BoardSquare } from "../types/types";

export const usePreMadeMove = (
  game: Chess,
  board: BoardSquare[][],
  playerColor: "w" | "b",
  makeMove: (
    from: string,
    to: string,
    promotion?: "q" | "r" | "n" | "b"
  ) => boolean,
  getBotMove: () => void
) => {
  const [preMadeMove, setPreMadeMove] = useState<{
    from: string;
    to: string;
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
  } | null>(null);

  useEffect(() => {
    // Clear pre-made move if the game is over
    if (game.isGameOver() || game.isResigned) {
      setPreMadeMove(null);
    }
  }, [game]);

  // Check if a square is part of the pre-made move
  const isPreMadeMove = useCallback(
    (square: string): boolean => {
      if (!preMadeMove) return false;
      return square === preMadeMove.from || square === preMadeMove.to;
    },
    [preMadeMove]
  );

  // Create a temporary game to check valid moves
  const createTempGame = useCallback((fen: string, turn: "w" | "b") => {
    const tempGame = new Chess(fen);
    const fenParts = tempGame.fen().split(" ");
    fenParts[1] = turn;
    const modifiedFen = fenParts.join(" ");
    tempGame.load(modifiedFen);
    return tempGame;
  }, []);

  // Handle creating a pre-made move
  const handlePreMadeMove = useCallback(
    (row: number, col: number) => {
      try {
        if (
          game.turn() === playerColor ||
          game.isGameOver() ||
          game.isResigned
        ) {
          return false;
        }

        // Get the square notation for the clicked position
        const square = `${"abcdefgh"[col]}${8 - row}` as Square;
        const piece = board[row][col];

        if (!preMadeMove) {
          if (piece && piece.color === playerColor) {
            const tempGame = createTempGame(game.fen(), playerColor);

            const moves = tempGame.moves({ square, verbose: true });

            if (moves.length > 0) {
              setPreMadeMove({
                from: square,
                to: "",
                fromRow: row,
                fromCol: col,
                toRow: -1,
                toCol: -1,
              });
              return true;
            }
          } else {
          }
        }
        // Second click - select destination or cancel selection
        else if (preMadeMove.from && preMadeMove.to === "") {
          if (square === preMadeMove.from) {
            setPreMadeMove(null);
            return true;
          }

          const tempGame = createTempGame(game.fen(), playerColor);

          const moves = tempGame.moves({
            square: preMadeMove.from as Square,
            verbose: true,
          });

          const isValidMove = moves.some((move) => move.to === square);

          if (isValidMove) {
            setPreMadeMove({
              ...preMadeMove,
              to: square,
              toRow: row,
              toCol: col,
            });
            return true;
          } else {
            return true;
          }
        }
        // If already have a complete pre-made move, clicking on it again cancels it
        else if (preMadeMove.from && preMadeMove.to) {
          if (square === preMadeMove.from || square === preMadeMove.to) {
            setPreMadeMove(null);
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error("Error in handlePreMadeMove:", error);
        return false;
      }
    },
    [game, board, playerColor, preMadeMove, createTempGame]
  );

  // Execute the pre-made move after the bot has moved
  const executePreMadeMove = useCallback(() => {
    if (preMadeMove && preMadeMove.to && game.turn() === playerColor) {
      console.log(
        `Executing pre-made move from ${preMadeMove.from} to ${preMadeMove.to}`
      );
      const moveSuccessful = makeMove(preMadeMove.from, preMadeMove.to);

      if (moveSuccessful) {
        setPreMadeMove(null);

        if (!game.isGameOver()) {
          setTimeout(getBotMove, 1000);
        }

        return true;
      } else {
        setPreMadeMove(null);
        console.log("Pre-made move execution failed");
      }
    }

    return false;
  }, [preMadeMove, game, playerColor, makeMove, getBotMove]);

  const cancelPreMadeMove = useCallback(() => {
    setPreMadeMove(null);
  }, []);

  return {
    preMadeMove,
    isPreMadeMove,
    handlePreMadeMove,
    executePreMadeMove,
    cancelPreMadeMove,
  };
};
