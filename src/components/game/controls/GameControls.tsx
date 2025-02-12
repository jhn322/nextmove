import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Chess } from "chess.js";
import { Info } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const currentTurn = gameStatus.toLowerCase().includes("white") ? "w" : "b";
  const isGameOver = game.isGameOver();

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Game Info Group */}
      <div className="space-y-2">
        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle>Game Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentTurn === "w"
                    ? "bg-blue-400 animate-pulse"
                    : "bg-blue-400/30"
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
              <div
                className={`w-3 h-3 rounded-full ${
                  currentTurn === "b"
                    ? "bg-red-400 animate-pulse"
                    : "bg-red-400/30"
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
            {game.isCheck() && (
              <p className="text-yellow-500 font-medium mt-2">Check!</p>
            )}
            {game.isCheckmate() && (
              <p className="text-red-500 font-medium mt-2">Checkmate!</p>
            )}
            {game.isDraw() && (
              <p className="text-blue-500 font-medium mt-2">Draw!</p>
            )}
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
                className="flex-1"
                disabled={playerColor === "w"}
              >
                White
              </Button>
              <Button
                onClick={() => onColorChange("b")}
                variant={playerColor === "b" ? "default" : "outline"}
                className="flex-1"
                disabled={playerColor === "b"}
              >
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

            {/* Resign Button */}
            <Button
              onClick={onResign}
              variant="destructive"
              className="w-full py-6 text-lg font-medium"
            >
              Resign
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Settings Group */}
      <div className="space-y-2">
        <Card className="border-0 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2">
              Difficulty
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change the bot opponent&apos;s skill level.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  onClick={() => onDifficultyChange(diff)}
                  variant={difficulty === diff ? "default" : "outline"}
                  className="w-full capitalize"
                  disabled={difficulty === diff}
                >
                  {diff}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameControls;
