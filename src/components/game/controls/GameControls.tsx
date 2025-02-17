import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Piece from "@/components/game/board/Piece";
import { Chess, Square } from "chess.js";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Flag,
  Info,
  Baby,
  Gamepad2,
  Swords,
  Sword,
  Crosshair,
  Target,
  Trophy,
  Award,
  Palette,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameControlsProps {
  difficulty: string;
  gameStatus: string;
  onResign: () => void;
  onColorChange: (color: "w" | "b") => void;
  onDifficultyChange: (difficulty: string) => void;
  playerColor: "w" | "b";
  gameTime: number;
  whiteTime: number;
  blackTime: number;
  game: Chess;
  onMoveBack: () => void;
  onMoveForward: () => void;
  canMoveBack: boolean;
  canMoveForward: boolean;
  onRematch: () => void;
  history: { fen: string; lastMove: { from: string; to: string } | null }[];
  pieceSet: string;
  onPieceSetChange: (set: string) => void;
}

const GameControls = ({
  difficulty,
  gameStatus,
  onResign,
  onColorChange,
  onDifficultyChange,
  playerColor,
  gameTime,
  whiteTime,
  blackTime,
  game,
  onMoveBack,
  onMoveForward,
  canMoveBack,
  canMoveForward,
  onRematch,
  history,
  pieceSet,
  onPieceSetChange,
}: GameControlsProps) => {
  const difficulties = [
    "beginner",
    "easy",
    "intermediate",
    "advanced",
    "hard",
    "expert",
    "master",
    "grandmaster",
  ];
  const pieceSets = [
    "california",
    "cardinal",
    "cburnett",
    "chessicons",
    "chessmonk",
    "chessnut",
    "freestaunton",
    "fresca",
    "gioco",
    "governor",
    "icpieces",
    "kosal",
    "maestro",
    "merida_new",
    "pixel",
    "riohacha",
    "staunty",
    "tatiana",
  ];
  const currentTurn = gameStatus.toLowerCase().includes("white") ? "w" : "b";
  const isGameOver = game.isGameOver();

  useEffect(() => {
    const scrollArea = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [history.length]);

  const difficultyIcons = {
    beginner: { icon: Baby, color: "text-emerald-500" },
    easy: { icon: Gamepad2, color: "text-green-500" },
    intermediate: { icon: Swords, color: "text-cyan-500" },
    advanced: { icon: Sword, color: "text-blue-500" },
    hard: { icon: Crosshair, color: "text-violet-500" },
    expert: { icon: Target, color: "text-purple-500" },
    master: { icon: Award, color: "text-orange-500" },
    grandmaster: { icon: Trophy, color: "text-red-500" },
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getMoveNumber = (index: number) => {
    return Math.ceil((index + 1) / 2);
  };

  const formatMove = (move: { from: string; to: string } | null) => {
    if (!move) return "-";
    return `${move.from}-${move.to}`;
  };

  const getPieceMoved = (fen: string, move: { from: string; to: string }) => {
    const tempGame = new Chess(fen);
    const piece = tempGame.get(move.from as Square);
    return piece ? piece.type : null;
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Game Info Group */}
      <div className="space-y-2">
        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2">
              Game Status
              {game.isCheck() && (
                <span className="text-yellow-500 font-medium">
                  <span className="mr-1.5">•</span>Check!
                </span>
              )}
              {game.isCheckmate() && (
                <span className="text-red-500 font-medium">
                  <span className="mr-1.5">•</span>Checkmate!
                </span>
              )}
              {game.isDraw() && (
                <span className="text-blue-500 font-medium">
                  <span className="mr-1.5">•</span>Draw!
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-3">
              <Crown
                className={`h-5 w-5 ${
                  currentTurn === "w"
                    ? "text-blue-400 animate-pulse"
                    : "text-blue-400/30"
                }`}
              />
              <span
                className={`font-medium ${
                  currentTurn === "w"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                White
              </span>
              <span className="text-muted-foreground mx-1">vs</span>
              <Crown
                className={`h-5 w-5 ${
                  currentTurn === "b"
                    ? "text-red-400 animate-pulse"
                    : "text-red-400/30"
                }`}
              />
              <span
                className={`font-medium ${
                  currentTurn === "b"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Black
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle>Game Time</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-mono text-xl">{formatTime(gameTime)}</span>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">White:</span>
              <span
                className={`font-mono text-xl ${
                  currentTurn === "w" && !game.isGameOver()
                    ? "text-blue-400"
                    : ""
                }`}
              >
                {formatTime(whiteTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Black:</span>
              <span
                className={`font-mono text-xl ${
                  currentTurn === "b" && !game.isGameOver()
                    ? "text-red-400"
                    : ""
                }`}
              >
                {formatTime(blackTime)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Move History */}
      <Card className="border-0 shadow-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle>Move History</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <div className="p-4 space-y-1">
              {history.slice(1).map((historyItem, index) => {
                const pieceType = historyItem.lastMove
                  ? getPieceMoved(history[index].fen, historyItem.lastMove)
                  : null;

                const isLatestMove = index === history.length - 2;

                return (
                  <div key={index} className="flex items-center text-sm">
                    {index % 2 === 0 ? (
                      // White's move
                      <div className="flex items-center w-full bg-accent/50 rounded-sm">
                        <span className="text-muted-foreground w-4 text-right mr-4 pl-2">
                          {getMoveNumber(index)}.
                        </span>
                        <div className="flex items-center gap-1 text-blue-400 w-full py-1 pr-2">
                          <div className="flex-1 flex items-center">
                            <span
                              className={`${
                                isLatestMove
                                  ? "bg-primary/20 rounded-[2px] px-1 -ml-1"
                                  : ""
                              }`}
                            >
                              {formatMove(historyItem.lastMove)}
                            </span>
                          </div>
                          {pieceType && (
                            <div className="w-1 h-1 scale-[0.4] mr-5 flex items-center brightness-0 dark:brightness-0 dark:invert">
                              <Piece
                                type={pieceType.toUpperCase()}
                                variant="symbol"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Black's move
                      <div className="flex items-center w-full bg-background">
                        <span className="text-muted-foreground w-4 text-right mr-4 pl-2">
                          {getMoveNumber(index)}.
                        </span>
                        <div className="flex items-center gap-1 text-red-400 w-full py-1 pr-2">
                          <div className="flex-1 flex items-center">
                            <span
                              className={`${
                                isLatestMove
                                  ? "bg-primary/20 rounded-[2px] px-1 -ml-1"
                                  : ""
                              }`}
                            >
                              {formatMove(historyItem.lastMove)}
                            </span>
                          </div>
                          {pieceType && (
                            <div className="w-1 h-1 scale-[0.4] mr-5 flex items-center brightness-0 dark:brightness-0 dark:invert">
                              <Piece
                                type={pieceType.toUpperCase()}
                                variant="symbol"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Player Controls Group */}
      <div className="space-y-2">
        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2">Play As</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex gap-3">
              <Button
                onClick={() => onColorChange("w")}
                variant={playerColor === "w" ? "default" : "outline"}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={playerColor === "w"}
              >
                <Crown className="h-4 w-4" />
                White
              </Button>
              <Button
                onClick={() => onColorChange("b")}
                variant={playerColor === "b" ? "default" : "outline"}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={playerColor === "b"}
              >
                <Crown className="h-4 w-4" />
                Black
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle>Game Controls</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Move Controls */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="default"
                onClick={onMoveBack}
                disabled={!canMoveBack || isGameOver}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={onMoveForward}
                disabled={!canMoveForward || isGameOver}
                className="flex-1 flex items-center justify-center gap-2"
              >
                Forward
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Rematch Button - Only show when game is over */}
            {isGameOver && (
              <Button
                onClick={onRematch}
                variant="default"
                className="w-full py-6 text-lg font-medium"
              >
                Rematch
              </Button>
            )}

            {/* Resign Button */}
            <Button
              onClick={onResign}
              variant="destructive"
              className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2"
            >
              <Flag className="h-5 w-5" />
              Resign
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Settings Group */}
      <div className="space-y-2" data-highlight-difficulty>
        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col gap-4">
              {/* Difficulty Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  Difficulty category
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change the skill level category of the bot.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={difficulty} onValueChange={onDifficultyChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const { icon: Icon, color } =
                            difficultyIcons[
                              difficulty as keyof typeof difficultyIcons
                            ];
                          return (
                            <Icon
                              className={`h-4 w-4 flex-shrink-0 ${color}`}
                            />
                          );
                        })()}
                        <span className="capitalize truncate">
                          {difficulty}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => {
                      const { icon: Icon, color } =
                        difficultyIcons[diff as keyof typeof difficultyIcons];
                      return (
                        <SelectItem key={diff} value={diff}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="capitalize">{diff}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Piece Set Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  Piece Set
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change the appearance of the chess pieces.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={pieceSet} onValueChange={onPieceSetChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="capitalize truncate">
                          {pieceSet.replace("_", " ")}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {pieceSets.map((set) => (
                      <SelectItem key={set} value={set}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {set.replace("_", " ")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameControls;
