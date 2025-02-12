import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Chess, Square } from "chess.js";
import type { BoardSquare } from "../types/types";

export const useMoveHandler = (
  game: Chess,
  board: BoardSquare[][],
  setBoard: Dispatch<SetStateAction<BoardSquare[][]>>,
  playerColor: "w" | "b",
  makeMove: (from: string, to: string) => boolean,
  setHistory: (fn: (prev: any[]) => any[]) => void,
  setCurrentMove: (fn: (prev: number) => number) => void,
  setLastMove: (move: { from: string; to: string } | null) => void,
  setGameStarted: (started: boolean) => void,
  getBotMove: () => void
) => {
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (game.turn() !== playerColor) return;

      if (!selectedPiece) {
        const piece = board[row][col];
        if (piece && piece.color === playerColor) {
          setSelectedPiece({ row, col });
          const from = `${"abcdefgh"[col]}${8 - row}` as Square;
          const moves = game.moves({ square: from, verbose: true });
          setPossibleMoves(moves.map((move) => move.to));
        }
      } else {
        const from = `${"abcdefgh"[selectedPiece.col]}${
          8 - selectedPiece.row
        }` as Square;
        const to = `${"abcdefgh"[col]}${8 - row}` as Square;

        try {
          const move = game.move({ from, to, promotion: "q" });
          if (move) {
            setBoard(game.board());
            setHistory((prev) => [
              ...prev,
              { fen: game.fen(), lastMove: { from, to } },
            ]);
            setCurrentMove((prev) => prev + 1);
            setLastMove({ from, to });

            if (!game.isGameOver()) {
              setTimeout(getBotMove, 1000);
            }

            if (!game.isGameOver()) {
              setGameStarted(true);
            }
          }
        } catch {
          console.log("Invalid move");
        }

        setSelectedPiece(null);
        setPossibleMoves([]);
      }
    },
    [
      game,
      board,
      playerColor,
      selectedPiece,
      setBoard,
      setHistory,
      setCurrentMove,
      setLastMove,
      setGameStarted,
      getBotMove,
    ]
  );

  return {
    selectedPiece,
    setSelectedPiece,
    possibleMoves,
    setPossibleMoves,
    handleSquareClick,
  };
};
