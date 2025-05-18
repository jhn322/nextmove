import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Chess, Square } from "chess.js";
import type { BoardSquare, HistoryEntry } from "../types/types";

export const useMoveHandler = (
  game: Chess,
  board: BoardSquare[][],
  setBoard: Dispatch<SetStateAction<BoardSquare[][]>>,
  playerColor: "w" | "b",
  makeMove: (
    from: string,
    to: string,
    promotion?: "q" | "r" | "n" | "b"
  ) => boolean,
  setHistory: Dispatch<SetStateAction<HistoryEntry[]>>,
  setCurrentMove: (fn: (prev: number) => number) => void,
  setLastMove: (move: { from: string; to: string } | null) => void,
  setGameStarted: (started: boolean) => void,
  getBotMove: () => void,
  setShowBotSelection: (show: boolean) => void,
  showBotSelection: boolean,
  autoQueen?: boolean
) => {
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (game.turn() !== playerColor) return;
      if (game.isGameOver() || game.isResigned) return;

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

        // Check if player is trying to move to the same position
        if (from === to) {
          setSelectedPiece(null);
          setPossibleMoves([]);
          return;
        }

        let moveSuccessful: boolean;
        const piece = game.get(from as Square);
        const isPromotion =
          piece &&
          piece.type === "p" &&
          ((piece.color === "w" && to[1] === "8") ||
            (piece.color === "b" && to[1] === "1"));
        if (autoQueen && isPromotion) {
          moveSuccessful = makeMove(from, to, "q");
        } else {
          moveSuccessful = makeMove(from, to);
        }

        if (moveSuccessful) {
          // Hide bot selection panel when first move is made
          if (showBotSelection) {
            setShowBotSelection(false);
          }

          setBoard(game.board());

          if (!game.isGameOver()) {
            setTimeout(getBotMove, 1000);
          }

          if (!game.isGameOver()) {
            setGameStarted(true);
            // Ensure the game state is saved with gameStarted=true
            const STORAGE_KEY = "chess-game-state";
            const currentState = JSON.parse(
              localStorage.getItem(STORAGE_KEY) || "{}"
            );
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                ...currentState,
                gameStarted: true,
              })
            );
          }
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
      makeMove,
      setBoard,
      setGameStarted,
      getBotMove,
      showBotSelection,
      setShowBotSelection,
      autoQueen,
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
