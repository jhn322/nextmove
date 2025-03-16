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
  getBotMove: () => void,
  setSelectedPiece?: (piece: { row: number; col: number } | null) => void,
  setPossibleMoves?: (moves: string[]) => void
) => {
  const [preMadeMove, setPreMadeMove] = useState<{
    from: string;
    to: string;
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
  } | null>(null);

  const [preMadePossibleMoves, setPreMadePossibleMoves] = useState<string[]>(
    []
  );

  useEffect(() => {
    // Clear pre-made move if the game is over
    if (game.isGameOver() || game.isResigned) {
      setPreMadeMove(null);
      setPreMadePossibleMoves([]);
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

  // Check if a square is a possible move for the pre-made move
  const isPreMadePossibleMove = useCallback(
    (square: string): boolean => {
      return preMadePossibleMoves.includes(square);
    },
    [preMadePossibleMoves]
  );

  // Create a temporary game to check valid moves
  const createTempGame = useCallback((fen: string, turn: "w" | "b") => {
    const tempGame = new Chess(fen);
    // Change the turn to the specified color
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
        // Only allow pre-made moves when it's not the player's turn
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

        // First click - select a piece
        if (!preMadeMove) {
          if (piece && piece.color === playerColor) {
            const tempGame = createTempGame(game.fen(), playerColor);

            // Check if the piece has any legal moves
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

              // Set possible moves for the selected piece
              setPreMadePossibleMoves(moves.map((move) => move.to));

              return true;
            }
          }
        }
        // Second click - select destination or cancel selection
        else if (preMadeMove.from && preMadeMove.to === "") {
          if (square === preMadeMove.from) {
            setPreMadeMove(null);
            setPreMadePossibleMoves([]);
            return true;
          }

          if (preMadePossibleMoves.includes(square)) {
            setPreMadeMove({
              ...preMadeMove,
              to: square,
              toRow: row,
              toCol: col,
            });
            // Clear possible moves once destination is selected
            setPreMadePossibleMoves([]);
            return true;
          } else {
            return true;
          }
        }
        // If already have a complete pre-made move, clicking on it again cancels it
        else if (preMadeMove.from && preMadeMove.to) {
          if (square === preMadeMove.from || square === preMadeMove.to) {
            setPreMadeMove(null);
            setPreMadePossibleMoves([]);
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error("Error in handlePreMadeMove:", error);
        return false;
      }
    },
    [
      game,
      board,
      playerColor,
      preMadeMove,
      createTempGame,
      preMadePossibleMoves,
    ]
  );

  // Execute the pre-made move after the bot has moved
  const executePreMadeMove = useCallback(() => {
    if (preMadeMove && preMadeMove.to && game.turn() === playerColor) {
      const moveSuccessful = makeMove(preMadeMove.from, preMadeMove.to);

      if (moveSuccessful) {
        setPreMadeMove(null);
        setPreMadePossibleMoves([]);

        if (!game.isGameOver()) {
          setTimeout(getBotMove, 1000);
        }

        return true;
      } else {
        // If move failed, clear the pre-made move
        setPreMadeMove(null);
        setPreMadePossibleMoves([]);
      }
    }

    return false;
  }, [preMadeMove, game, playerColor, makeMove, getBotMove]);

  // Clear the pre-made move
  const cancelPreMadeMove = useCallback(() => {
    setPreMadeMove(null);
    setPreMadePossibleMoves([]);
  }, []);

  // Transfer pre-made move to normal move when turn changes
  useEffect(() => {
    // If it's the player's turn and we have a pre-made move with a destination, execute it
    if (game.turn() === playerColor && preMadeMove && preMadeMove.to) {
      if (!executePreMadeMove()) {
        cancelPreMadeMove();
      }
    }
    // If it's the player's turn and we have a pre-made move with only a source selected,
    // transfer it to a normal move selection
    else if (
      game.turn() === playerColor &&
      preMadeMove &&
      preMadeMove.to === "" &&
      setSelectedPiece &&
      setPossibleMoves
    ) {
      // Transfer the pre-selected piece to the normal move selection
      setSelectedPiece({
        row: preMadeMove.fromRow,
        col: preMadeMove.fromCol,
      });

      // Calculate possible moves for this piece in the current game state
      try {
        const square = preMadeMove.from as Square;
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map((move) => move.to));
      } catch (error) {
        console.error("Error calculating moves for transferred piece:", error);
        setPossibleMoves([]);
      }

      // Clear the pre-made move since it's now a normal move
      setPreMadeMove(null);
      setPreMadePossibleMoves([]);
    }
  }, [
    game.turn(),
    playerColor,
    preMadeMove,
    executePreMadeMove,
    cancelPreMadeMove,
    setSelectedPiece,
    setPossibleMoves,
    game,
  ]);

  return {
    preMadeMove,
    isPreMadeMove,
    isPreMadePossibleMove,
    handlePreMadeMove,
    executePreMadeMove,
    cancelPreMadeMove,
  };
};
