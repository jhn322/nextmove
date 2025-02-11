"use client";

import { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";
import SquareComponent from "@/components/Square";
import Piece from "@/components/Piece";
import GameControls from "@/components/GameControls";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type StockfishEngine = Worker;

const STORAGE_KEY = "chess-game-state";
const DEFAULT_STATE = {
  fen: new Chess().fen(),
  playerColor: "w",
  gameTime: 0,
  whiteTime: 0,
  blackTime: 0,
  difficulty: "beginner",
  gameStarted: false,
};

const ChessBoard = ({ difficulty }: { difficulty: string }) => {
  const router = useRouter();

  // Load initial state from localStorage or use defaults
  const loadSavedState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Only restore if it's the same difficulty level
      if (state.difficulty === difficulty) {
        return {
          ...state,
          history: state.history || [DEFAULT_STATE.fen],
          currentMove: state.currentMove || 1,
        };
      }
    }
    return {
      ...DEFAULT_STATE,
      difficulty,
      history: [DEFAULT_STATE.fen],
      currentMove: 1,
    };
  };

  const savedState = loadSavedState();
  const [history, setHistory] = useState(savedState.history);
  const [currentMove, setCurrentMove] = useState(savedState.currentMove);
  const [game] = useState(() => {
    const chess = new Chess();
    chess.load(savedState.fen);
    return chess;
  });

  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<string | null>(
    null
  );
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [pendingColor, setPendingColor] = useState<"w" | "b" | null>(null);
  const [board, setBoard] = useState(game.board());
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [engine, setEngine] = useState<StockfishEngine | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<"w" | "b">(
    savedState.playerColor
  );
  const [gameTime, setGameTime] = useState(0);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(savedState.gameStarted);

  // Save state
  useEffect(() => {
    const state = {
      fen: game.fen(),
      playerColor,
      gameTime,
      whiteTime,
      blackTime,
      difficulty,
      gameStarted,
      history,
      currentMove,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  ]);

  // Track total and per-player time
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStarted && !game.isGameOver()) {
        // Only count if game has started
        setGameTime((prev) => prev + 1);

        if (game.turn() === "w") {
          setWhiteTime((prev) => prev + 1);
        } else {
          setBlackTime((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameStarted]);

  const handleDifficultyChange = (newDifficulty: string) => {
    if (gameStarted) {
      setPendingDifficulty(newDifficulty);
      setShowDifficultyDialog(true);
    } else {
      // If no game in progress, change difficulty directly
      const skillLevel =
        {
          beginner: 2,
          easy: 5,
          intermediate: 8,
          advanced: 11,
          hard: 14,
          expert: 17,
          master: 20,
          grandmaster: 23,
        }[newDifficulty] || 10;

      if (engine) {
        engine.postMessage("setoption name Skill Level value " + skillLevel);
      }
      // Reset the game and navigate to new difficulty
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
          // Update history and currentMove using their current values
          setHistory((prev: string[]) => [...prev, game.fen()]);
          setCurrentMove((prev: number) => prev + 1);
          return true;
        }
      } catch {
        console.log("Invalid move");
      }
      return false;
    },
    [game]
  );

  // Get bot's move
  const getBotMove = useCallback(() => {
    if (engine && !game.isGameOver()) {
      engine.postMessage("position fen " + game.fen());
      engine.postMessage("go movetime 1000"); // Think for 1 second
    }
  }, [engine, game]);

  // Move back to the previous position in history
  const moveBack = useCallback(() => {
    if (currentMove > 1) {
      const newPosition = currentMove - 1;
      game.load(history[newPosition - 1]);
      setBoard(game.board());
      setCurrentMove(newPosition);
    }
  }, [currentMove, game, history]);

  // Move forward to the next position in history
  const moveForward = useCallback(() => {
    if (currentMove < history.length) {
      game.load(history[currentMove]);
      setBoard(game.board());
      setCurrentMove(currentMove + 1);
    }
  }, [currentMove, history.length, game, history]);

  // Initialize Stockfish
  useEffect(() => {
    const stockfish = new Worker("/stockfish.js");

    stockfish.onmessage = (event: MessageEvent) => {
      const message = event.data;
      // When Stockfish finds the best move
      if (message.startsWith("bestmove")) {
        const moveStr = message.split(" ")[1];
        if (!game.isGameOver()) {
          // Add check to prevent moves after game over
          makeMove(moveStr.slice(0, 2), moveStr.slice(2, 4));
        }
      }
    };

    setEngine(stockfish);

    // Set difficulty
    const skillLevel =
      {
        beginner: 2,
        easy: 5,
        intermediate: 8,
        advanced: 11,
        hard: 14,
        expert: 17,
        master: 20,
        grandmaster: 23,
      }[difficulty] || 10;

    stockfish.postMessage("uci");
    stockfish.postMessage("setoption name Skill Level value " + skillLevel);

    return () => {
      stockfish.terminate();
    };
  }, [difficulty, makeMove, game]);

  const handleSquareClick = (row: number, col: number) => {
    // Only allow moves if it's player's turn
    if (game.turn() !== playerColor) return;

    if (!selectedPiece) {
      // If no piece is selected and the clicked square has a piece
      const piece = board[row][col];
      if (piece && piece.color === playerColor) {
        setSelectedPiece({ row, col });
        const from = `${"abcdefgh"[col]}${8 - row}` as Square;
        const moves = game.moves({ square: from, verbose: true });
        setPossibleMoves(moves.map((move) => move.to));
      }
    } else {
      // Try to make a move
      const from = `${"abcdefgh"[selectedPiece.col]}${
        8 - selectedPiece.row
      }` as Square;
      const to = `${"abcdefgh"[col]}${8 - row}` as Square;

      const moveMade = makeMove(from, to);
      if (moveMade) {
        if (!gameStarted) {
          setGameStarted(true); // Set game as started when first move is made
        }
        // If player's move was successful, get bot's move
        setTimeout(getBotMove, 500);
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
    setGameTime(0);
    setWhiteTime(0);
    setBlackTime(0);
    setGameStarted(false);
    setHistory([DEFAULT_STATE.fen]);
    setCurrentMove(1);

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
      setGameTime(0);
      setWhiteTime(0);
      setBlackTime(0);
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
      setGameTime(0);
      setWhiteTime(0);
      setBlackTime(0);
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
                  const isKingInCheck =
                    game.isCheck() &&
                    piece?.type.toLowerCase() === "k" &&
                    piece?.color === game.turn();

                  return (
                    <SquareComponent
                      key={`${rowIndex}-${colIndex}`}
                      isLight={(rowIndex + colIndex) % 2 === 0}
                      isSelected={
                        selectedPiece?.row === rowIndex &&
                        selectedPiece?.col === colIndex
                      }
                      isPossibleMove={possibleMoves.includes(
                        `${"abcdefgh"[colIndex]}${8 - rowIndex}`
                      )}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                      difficulty={difficulty}
                      isCheck={isKingInCheck}
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

      {/* Resign Dialog */}
      <AlertDialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Resign Game?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to resign? This will count as a loss and
              start a new game.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResign}>
              Resign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Difficulty Change Dialog */}
      <AlertDialog
        open={showDifficultyDialog}
        onOpenChange={setShowDifficultyDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Change Difficulty?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your current game will be lost by changing difficulty. Are you
              sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDifficultyChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Color Change Dialog */}
      <AlertDialog open={showColorDialog} onOpenChange={setShowColorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Change Color?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your current game will be lost by changing colors. Are you sure
              you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmColorChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChessBoard;
