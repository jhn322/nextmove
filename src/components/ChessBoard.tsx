"use client";

import { useState, useEffect } from "react";
import { Square } from "chess.js";
import { useStockfish } from "./ChessBoard/hooks/useStockfish";
import {
  STORAGE_KEY,
  DEFAULT_STATE,
  DIFFICULTY_LEVELS,
} from "./ChessBoard/constants";
import { useRouter } from "next/navigation";
import { useChessGame } from "./ChessBoard/hooks/useChessGame";
import { useGameTimer } from "./ChessBoard/hooks/useGameTimer";
import type { HistoryEntry } from "./ChessBoard/types";
import GameDialogs from "./ChessBoard/GameDialogs";
import GameControls from "@/components/GameControls";
import SquareComponent from "@/components/Square";
import Piece from "@/components/Piece";

const ChessBoard = ({ difficulty }: { difficulty: string }) => {
  const router = useRouter();

  const {
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
  } = useChessGame(difficulty);

  // Hooks ----------------------------------------------------
  const { engine, getBotMove, setSkillLevel } = useStockfish(
    game,
    difficulty,
    makeMove
  );
  const { gameTime, whiteTime, blackTime, resetTimers } = useGameTimer(
    game,
    gameStarted
  );
  // -----------------------------------------------------------

  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<string | null>(
    null
  );
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [pendingColor, setPendingColor] = useState<"w" | "b" | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  // Save state
  useEffect(() => {
    const gameState = {
      fen: game.fen(),
      playerColor,
      gameTime,
      whiteTime,
      blackTime,
      difficulty,
      gameStarted,
      history,
      currentMove,
      lastMove,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [
    game,
    playerColor,
    gameTime,
    whiteTime,
    blackTime,
    difficulty,
    gameStarted,
    history,
    currentMove,
    lastMove,
  ]);

  const handleDifficultyChange = (newDifficulty: string) => {
    if (gameStarted) {
      setPendingDifficulty(newDifficulty);
      setShowDifficultyDialog(true);
    } else {
      if (engine) {
        setSkillLevel(
          DIFFICULTY_LEVELS[newDifficulty as keyof typeof DIFFICULTY_LEVELS]
        );
      }
      handleRestart();
      router.push(`/play/${newDifficulty.toLowerCase()}`);
    }
  };
  const handleConfirmDifficultyChange = () => {
    if (pendingDifficulty) {
      localStorage.removeItem("chess-game-state");
      router.push(`/play/${pendingDifficulty.toLowerCase()}`);
    }
    setShowDifficultyDialog(false);
    setPendingDifficulty(null);
    setGameStarted(false); // Reset game started state
  };

  const handleCancelDialog = () => {
    setShowResignDialog(false);
    setShowDifficultyDialog(false);
    setShowColorDialog(false);
  };

  // Clear lastMove when opponent's turn starts
  useEffect(() => {
    if (game.turn() !== playerColor && lastMove?.from !== undefined) {
      // Only clear if it's opponent's turn AND there's a lastMove to clear
      const isOpponentMove = lastMove.from.includes(game.turn());
      if (isOpponentMove) {
        console.log("Clearing lastMove because opponent's turn");
        setLastMove(null);
      }
    }
  }, [game.turn(), playerColor, lastMove, game]);

  const handleSquareClick = (row: number, col: number) => {
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
          setHistory((prev: HistoryEntry[]) => [
            ...prev,
            { fen: game.fen(), lastMove: { from, to } },
          ]);
          setCurrentMove((prev: number) => prev + 1);
          setLastMove({ from, to });

          if (!gameStarted) {
            setGameStarted(true);
          }
          setTimeout(getBotMove, 1000);
        }
      } catch {
        console.log("Invalid move");
      }

      setSelectedPiece(null);
      setPossibleMoves([]);
    }
  };

  // Game status display
  const getGameStatus = () => {
    if (game.isCheckmate())
      return `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`;
    if (game.isDraw()) return "Game is a draw!";
    if (game.isCheck())
      return `${game.turn() === "w" ? "White" : "Black"} is in check!`;
    return `${game.turn() === "w" ? "White" : "Black"} turn to move`;
  };

  // Game restart
  const handleRestart = () => {
    game.reset();
    setBoard(game.board());
    setSelectedPiece(null);
    setPossibleMoves([]);
    resetTimers();
    setGameStarted(false);
    setHistory([{ fen: DEFAULT_STATE.fen, lastMove: null }]);
    setCurrentMove(1);
    setLastMove(null);

    // Save state with preserved player color
    const currentState = {
      ...DEFAULT_STATE,
      playerColor,
      difficulty,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    if (playerColor === "b") {
      setTimeout(getBotMove, 500);
    }
  };

  const handleColorChange = (color: "w" | "b") => {
    if (gameStarted) {
      setPendingColor(color);
      setShowColorDialog(true);
    } else {
      // If no game in progress, change color directly
      setPlayerColor(color);
      game.reset();
      setBoard(game.board());
      setSelectedPiece(null);
      setPossibleMoves([]);
      resetTimers();
      setGameStarted(false);

      // Save the new state with updated color
      const newState = {
        ...DEFAULT_STATE,
        playerColor: color,
        difficulty,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

      if (color === "b") {
        setTimeout(getBotMove, 500);
      }
    }
  };

  const handleConfirmColorChange = () => {
    if (pendingColor) {
      setPlayerColor(pendingColor);
      game.reset();
      setBoard(game.board());
      setSelectedPiece(null);
      setPossibleMoves([]);
      resetTimers();
      setGameStarted(false);

      // Save the new state with updated color
      const newState = {
        ...DEFAULT_STATE,
        playerColor: pendingColor,
        difficulty,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

      if (pendingColor === "b") {
        setTimeout(getBotMove, 500);
      }
    }
    setShowColorDialog(false);
    setPendingColor(null);
  };

  // Start resign dialog
  const handleResign = () => {
    setShowResignDialog(true);
  };

  // Confirm resign and reset game
  const handleConfirmResign = () => {
    handleRestart();
    setShowResignDialog(false);
  };

  return (
    <>
      <main className="flex flex-col w-full lg:flex-row items-center lg:items-start justify-center gap-4 p-4 min-h-[calc(90vh-4rem)]">
        <div className="w-full max-w-[min(90vh,90vw)] lg:max-w-[89vh]">
          <div className="w-full aspect-square">
            <div className="w-full h-full grid grid-cols-8 border border-border rounded-lg overflow-hidden">
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const square = `${"abcdefgh"[colIndex]}${8 - rowIndex}`;
                  const isKingInCheck =
                    game.isCheck() &&
                    piece?.type.toLowerCase() === "k" &&
                    piece?.color === game.turn();
                  const isLastMove =
                    lastMove &&
                    (square === lastMove.from || square === lastMove.to);

                  return (
                    <SquareComponent
                      key={`${rowIndex}-${colIndex}`}
                      isLight={(rowIndex + colIndex) % 2 === 0}
                      isSelected={
                        selectedPiece?.row === rowIndex &&
                        selectedPiece?.col === colIndex
                      }
                      isPossibleMove={possibleMoves.includes(square)}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                      difficulty={difficulty}
                      isCheck={isKingInCheck}
                      isLastMove={isLastMove ?? false}
                    >
                      {piece && (
                        <Piece
                          type={
                            piece.color === "w"
                              ? piece.type.toUpperCase()
                              : piece.type.toLowerCase()
                          }
                        />
                      )}
                    </SquareComponent>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 rounded-lg">
          <GameControls
            difficulty={difficulty}
            gameStatus={getGameStatus()}
            onResign={handleResign}
            onColorChange={handleColorChange}
            onDifficultyChange={handleDifficultyChange}
            playerColor={playerColor}
            gameTime={gameTime}
            whiteTime={whiteTime}
            blackTime={blackTime}
            game={game}
            onMoveBack={moveBack}
            onMoveForward={moveForward}
            canMoveBack={currentMove > 1}
            canMoveForward={currentMove < history.length}
          />
        </div>
      </main>

      <GameDialogs
        showResignDialog={showResignDialog}
        showDifficultyDialog={showDifficultyDialog}
        showColorDialog={showColorDialog}
        onConfirmResign={handleConfirmResign}
        onConfirmDifficultyChange={handleConfirmDifficultyChange}
        onConfirmColorChange={handleConfirmColorChange}
        onCancelDialog={handleCancelDialog}
      />
    </>
  );
};

export default ChessBoard;
