import { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";
import SquareComponent from "@/components/Square";
import Piece from "@/components/Piece";
import GameControls from "@/components/GameControls";

type StockfishEngine = Worker;

const ChessBoard = ({ difficulty }: { difficulty: string }) => {
  const [game] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [engine, setEngine] = useState<StockfishEngine | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [gameTime, setGameTime] = useState(0);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

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
    // Update engine skill level
    const skillLevel =
      {
        easy: 2,
        intermediate: 8,
        hard: 14,
        expert: 20,
      }[newDifficulty] || 10;

    if (engine) {
      engine.postMessage("setoption name Skill Level value " + skillLevel);
    }

    // Reset the game
    handleRestart();
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
          if (!gameStarted) {
            setGameStarted(true); // Start timer on first move
          }
          setBoard(game.board());
          return true;
        }
      } catch {
        console.log("Invalid move");
      }
      return false;
    },
    [game]
  );

  // Initialize Stockfish
  useEffect(() => {
    const stockfish = new Worker("/stockfish.js");

    stockfish.onmessage = (event: MessageEvent) => {
      const message = event.data;
      // When Stockfish finds the best move
      if (message.startsWith("bestmove")) {
        const moveStr = message.split(" ")[1];
        makeMove(moveStr.slice(0, 2), moveStr.slice(2, 4));
      }
    };

    setEngine(stockfish);

    // Set difficulty
    const skillLevel =
      {
        easy: 2,
        intermediate: 8,
        hard: 14,
        expert: 20,
      }[difficulty] || 10;

    stockfish.postMessage("uci");
    stockfish.postMessage("setoption name Skill Level value " + skillLevel);

    return () => {
      stockfish.terminate();
    };
  }, [difficulty, makeMove]);

  // Get bot's move
  const getBotMove = useCallback(() => {
    if (engine && !game.isGameOver()) {
      engine.postMessage("position fen " + game.fen());
      engine.postMessage("go movetime 1000"); // Think for 1 second
    }
  }, [engine, game]);

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

  const handleRestart = () => {
    game.reset();
    setBoard(game.board());
    setSelectedPiece(null);
    setPossibleMoves([]);
    setGameTime(0);
    setWhiteTime(0);
    setBlackTime(0);
    setGameStarted(false);
    if (playerColor === "b") {
      setTimeout(getBotMove, 500);
    }
  };

  const handleResign = () => {
    alert(`${playerColor === "w" ? "White" : "Black"} resigns!`);
    // Reset everything
    handleRestart();
  };

  return (
    <div className="flex flex-col w-full lg:flex-row items-center lg:items-start justify-center gap-4 p-4 min-h-[calc(90vh-4rem)]">
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
          onRestart={handleRestart}
          onResign={handleResign}
          gameTime={gameTime}
          whiteTime={whiteTime}
          blackTime={blackTime}
          playerColor={playerColor}
          game={game}
          onDifficultyChange={handleDifficultyChange}
          onColorChange={(color) => {
            setPlayerColor(color);
            game.reset();
            setBoard(game.board());
            setSelectedPiece(null);
            setPossibleMoves([]);
            setGameTime(0);
            if (color === "b") {
              setTimeout(getBotMove, 500);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChessBoard;
