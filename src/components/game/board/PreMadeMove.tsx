import { useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { usePreMadeMove } from "@/hooks/usePreMadeMove";
import type { BoardSquare } from "@/types/types";

interface PreMadeMoveProps {
  game: Chess;
  board: BoardSquare[][];
  playerColor: "w" | "b";
  makeMove: (
    from: string,
    to: string,
    promotion?: "q" | "r" | "n" | "b"
  ) => boolean;
  getBotMove: () => void;
  onPreMadeMoveChange: (isPreMadeMove: (square: string) => boolean) => void;
  onHandleSquareClick: (handler: (row: number, col: number) => boolean) => void;
  onPossibleMovesChange: (isPossibleMove: (square: string) => boolean) => void;
  setSelectedPiece: (piece: { row: number; col: number } | null) => void;
  setPossibleMoves: (moves: string[]) => void;
}

const PreMadeMove = ({
  game,
  board,
  playerColor,
  makeMove,
  getBotMove,
  onPreMadeMoveChange,
  onHandleSquareClick,
  onPossibleMovesChange,
  setSelectedPiece,
  setPossibleMoves,
}: PreMadeMoveProps) => {
  const {
    isPreMadeMove,
    handlePreMadeMove,
    executePreMadeMove,
    preMadeMove,
    isPreMadePossibleMove,
    cancelPreMadeMove,
  } = usePreMadeMove(
    game,
    board,
    playerColor,
    makeMove,
    getBotMove,
    setSelectedPiece,
    setPossibleMoves
  );

  // Use a ref to track the previous turn
  const prevTurnRef = useRef(game.turn());
  const executionAttemptedRef = useRef(false);

  // Pass the isPreMadeMove function to the parent component
  useEffect(() => {
    onPreMadeMoveChange(isPreMadeMove);
  }, [isPreMadeMove, onPreMadeMoveChange]);

  // Pass the isPreMadePossibleMove function to the parent component
  useEffect(() => {
    onPossibleMovesChange(isPreMadePossibleMove);
  }, [isPreMadePossibleMove, onPossibleMovesChange]);

  // Pre-compute complex expressions for dependency array
  const currentGameTurn = game.turn();

  // Execute or cancel pre-made move based on turn changes
  useEffect(() => {
    const currentTurn = currentGameTurn;
    const previousTurn = prevTurnRef.current; // Value from before this effect ran

    let timerId: NodeJS.Timeout | undefined;

    // Scenario 1: Turn just switched to Player, and a COMPLETE pre-made move exists. Execute it.
    if (
      currentTurn === playerColor &&
      previousTurn !== playerColor &&
      preMadeMove &&
      preMadeMove.from &&
      preMadeMove.to &&
      !executionAttemptedRef.current
    ) {
      executionAttemptedRef.current = true;
      timerId = setTimeout(() => {
        const result = executePreMadeMove();
        if (!result) {
          cancelPreMadeMove(); // If execution failed, cancel to clear highlights
        }
        executionAttemptedRef.current = false; // Reset after attempt
      }, 300);
    }
    // Scenario 2: Turn just switched to Player, but only a PARTIAL pre-made move exists. Cancel it.
    else if (
      currentTurn === playerColor &&
      previousTurn !== playerColor &&
      preMadeMove &&
      preMadeMove.from &&
      !preMadeMove.to
    ) {
      cancelPreMadeMove();
    }
    // Scenario 3: Turn just switched AWAY from Player, and ANY pre-made move was active. Cancel it.
    else if (
      previousTurn === playerColor &&
      currentTurn !== playerColor &&
      preMadeMove &&
      preMadeMove.from
    ) {
      cancelPreMadeMove();
      // If a premove was pending execution and turn switched away, ensure execution flag is reset
      executionAttemptedRef.current = false;
    }

    // If the turn genuinely changed, reset the executionAttempted flag.
    // This is important if, for example, a premove was attempted, turn changed,
    // then changed back, allowing another attempt.
    if (previousTurn !== currentTurn) {
      executionAttemptedRef.current = false;
    }

    // Update prevTurnRef for the next run of this effect.
    prevTurnRef.current = currentTurn;

    // Cleanup function for the timer
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [
    currentGameTurn,
    playerColor,
    preMadeMove,
    executePreMadeMove,
    cancelPreMadeMove,
    game,
  ]);

  // Pass the handlePreMadeMove function to the parent component
  useEffect(() => {
    onHandleSquareClick(handlePreMadeMove);
  }, [handlePreMadeMove, onHandleSquareClick]);

  // Pre-compute complex expressions for dependency array
  const isGameOver = game.isGameOver();
  const isResigned = game.isResigned;

  // Clear pre-made move when game is over
  useEffect(() => {
    if (isGameOver || isResigned) {
      cancelPreMadeMove();
    }
  }, [isGameOver, isResigned, cancelPreMadeMove, game]);

  return null;
};

export default PreMadeMove;
