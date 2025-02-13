import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Chess } from "chess.js";
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
} from "lucide-react";
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
  onRematch: () => void;
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

  const difficultyIcons = {
    beginner: { icon: Baby, color: "text-emerald-500" },
    easy: { icon: Gamepad2, color: "text-green-500" },
    intermediate: { icon: Swords, color: "text-cyan-500" },
    advanced: { icon: Sword, color: "text-blue-500" },
    hard: { icon: Crosshair, color: "text-violet-500" },
    expert: { icon: Target, color: "text-purple-500" },
    master: { icon: Trophy, color: "text-orange-500" },
    grandmaster: { icon: Award, color: "text-red-500" },
  };

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
              {difficulties.map((diff) => {
                const { icon: Icon, color } =
                  difficultyIcons[diff as keyof typeof difficultyIcons];
                return (
                  <TooltipProvider key={diff}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => onDifficultyChange(diff)}
                          variant={difficulty === diff ? "default" : "outline"}
                          className="w-full justify-start pl-3 pr-2 text-xs font-medium"
                          disabled={difficulty === diff}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0  ${
                              difficulty === diff ? "" : color
                            }`}
                          />
                          <span className="capitalize">{diff}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {diff === "beginner" &&
                          "Learn the basics with a bot that makes predictable moves."}
                        {diff === "easy" &&
                          "Practice basic strategies with slightly improved moves."}
                        {diff === "intermediate" &&
                          "Test your skills against a bot with moderate tactical awareness."}
                        {diff === "advanced" &&
                          "Face stronger tactical play and strategic planning."}
                        {diff === "hard" &&
                          "Challenge yourself with advanced strategies and combinations."}
                        {diff === "expert" &&
                          "Test yourself against sophisticated positional understanding."}
                        {diff === "master" &&
                          "Face the second strongest bot with sophisticated chess understanding."}
                        {diff === "grandmaster" &&
                          "Challenge the ultimate bot with masterful chess execution."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameControls;
