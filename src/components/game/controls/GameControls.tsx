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
  Palette,
  UserPlus,
  AlertCircle,
  HandshakeIcon,
  Lightbulb,
  PlayCircle,
  Swords,
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
  onNewBot: () => void;
  handleNewBotDialog: () => void;
  onHintRequested: () => void;
  isCalculatingHint: boolean;
}

interface GameStatusIndicatorProps {
  game: Chess;
}

interface PlayerIndicatorProps {
  color: "w" | "b";
  isActive: boolean;
  children: React.ReactNode;
}

// Game Status UI
const GameStatusIndicator = ({ game }: GameStatusIndicatorProps) => {
  if (game.isCheckmate()) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full animate-pulse">
        <Swords className="h-4 w-4" />
        <span className="font-semibold">Checkmate!</span>
      </div>
    );
  }

  if (game.isCheck()) {
    return (
      <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full animate-pulse">
        <AlertCircle className="h-4 w-4" />
        <span className="font-semibold">Check!</span>
      </div>
    );
  }

  if (game.isDraw()) {
    return (
      <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full">
        <HandshakeIcon className="h-4 w-4" />
        <span className="font-semibold">Draw!</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full">
      <PlayCircle className="h-4 w-4" />
      <span className="font-semibold">In Progress</span>
    </div>
  );
};

// Player(s) UI
const PlayerIndicator = ({
  color,
  isActive,
  children,
}: PlayerIndicatorProps) => {
  const getColors = () => {
    if (color === "w") {
      return {
        bg: isActive ? "bg-blue-500/10" : "bg-blue-500/5",
        text: isActive ? "text-blue-500" : "text-blue-500/50",
        border: isActive ? "border-blue-500/20" : "border-transparent",
      };
    }
    return {
      bg: isActive ? "bg-red-500/10" : "bg-red-500/5",
      text: isActive ? "text-red-500" : "text-red-500/50",
      border: isActive ? "border-red-500/20" : "border-transparent",
    };
  };

  const { bg, text, border } = getColors();

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${bg} ${text} ${border} transition-all duration-200`}
    >
      <Crown
        className={`h-5 w-5 ${isActive ? "animate-pulse" : "opacity-50"} ${
          color === "w" ? "fill-current" : ""
        }`}
      />
      <span className="font-medium">{children}</span>
    </div>
  );
};

const GameControls = ({
  gameStatus,
  onResign,
  onColorChange,
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
  handleNewBotDialog,
  onHintRequested,
  isCalculatingHint,
}: GameControlsProps) => {
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
  const isGameOver = game.isGameOver() || game.isResigned;

  useEffect(() => {
    const scrollArea = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [history.length]);

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
    <div className="space-y-4 rounded-lg border border-border bg-card p-3 w-full lg:p-4">
      {/* Game Info Group */}
      <div className="space-y-2">
        <Card className="border-0 shadow-none">
          <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
            <CardTitle className="flex items-center text-md">
              <span className="mr-2 text-muted-foreground">Game Status:</span>
              <GameStatusIndicator game={game} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
            <div className="flex items-center gap-3">
              <PlayerIndicator color="w" isActive={currentTurn === "w"}>
                White
              </PlayerIndicator>
              <span className="text-muted-foreground font-medium">vs</span>
              <PlayerIndicator color="b" isActive={currentTurn === "b"}>
                Black
              </PlayerIndicator>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
            <CardTitle className="text-md">Game Time</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0 space-y-2">
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
        <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
          <CardTitle className="text-md">Move History</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
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
                            <div className="w-5 h-5 flex items-center justify-center brightness-0 dark:brightness-0 dark:invert">
                              <Piece
                                type={pieceType.toUpperCase()}
                                pieceSet={pieceSet}
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
                            <div className="w-5 h-5 flex items-center justify-center brightness-0 dark:brightness-0 dark:invert">
                              <Piece
                                type={pieceType.toUpperCase()}
                                pieceSet={pieceSet}
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
          <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
            <CardTitle className="flex items-center gap-2 text-md">
              Play As
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
            <div className="flex gap-3">
              <Button
                onClick={() => onColorChange("w")}
                variant={playerColor === "w" ? "default" : "outline"}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={playerColor === "w"}
              >
                <Crown className="h-4 w-4 fill-current" />
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
          <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
            <CardTitle className="text-md">Game Controls</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0 space-y-4">
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

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {/* Gameplay Buttons Row */}
              <div className="flex gap-3">
                {/* Hint Button */}
                <Button
                  onClick={onHintRequested}
                  variant="outline"
                  disabled={
                    game.isGameOver() ||
                    game.turn() !== playerColor ||
                    isCalculatingHint
                  }
                  className="flex-1 py-5 text-base font-medium flex items-center justify-center gap-2"
                >
                  <Lightbulb
                    className={`h-5 w-5 ${
                      isCalculatingHint ? "animate-pulse" : ""
                    }`}
                  />
                  {isCalculatingHint ? "Thinking..." : "Hint"}
                </Button>

                {/* Rematch Button - Only show when game is over */}
                {isGameOver ? (
                  <Button
                    onClick={onRematch}
                    variant="default"
                    className="flex-1 py-5 text-base font-medium flex items-center justify-center gap-2"
                  >
                    <HandshakeIcon className="h-5 w-5" />
                    Rematch
                  </Button>
                ) : (
                  <Button
                    onClick={onResign}
                    variant="destructive"
                    className="flex-1 py-5 text-base font-medium flex items-center justify-center gap-2"
                    disabled={game.isGameOver()}
                  >
                    <Flag className="h-5 w-5" />
                    Resign
                  </Button>
                )}
              </div>

              {/* New Bot Button - Always visible */}
              <Button
                onClick={handleNewBotDialog}
                variant="secondary"
                className="w-full py-5 text-base font-medium flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                New Bot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Settings Group */}
      <div className="space-y-2" data-highlight-difficulty>
        <Card className="border-0 shadow-none">
          <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
            <CardTitle className="text-md">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
            <div className="flex flex-col gap-4">
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
