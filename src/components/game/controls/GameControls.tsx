import { useEffect, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Piece from "@/components/game/board/Piece";
import { Chess, Square } from "chess.js";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Flag,
  UserPlus,
  AlertCircle,
  HandshakeIcon,
  Lightbulb,
  PlayCircle,
  Swords,
  TrendingUp,
} from "lucide-react";
import { BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { useRouter } from "next/navigation";
import { Bot } from "@/components/game/data/bots";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EloBadge from "@/components/ui/elo-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomChess extends Chess {
  isResigned?: boolean;
  resignedColor?: "w" | "b";
}

interface GameControlsProps {
  difficulty: string;
  onResign: () => void;
  onDifficultyChange: (difficulty: string) => void;
  playerColor: "w" | "b";
  gameTime: number;
  whiteTime: number;
  blackTime: number;
  game: CustomChess;
  onMoveBack: () => void;
  onMoveForward: () => void;
  canMoveBack: boolean;
  canMoveForward: boolean;
  onRematch: () => void;
  history: { fen: string; lastMove: { from: string; to: string } | null }[];
  pieceSet: string;
  onNewBot: () => void;
  handleNewBotDialog: () => void;
  onHintRequested: () => void;
  isCalculatingHint: boolean;
  selectedBot?: Bot & { difficulty?: string };
}

interface GameStatusIndicatorProps {
  game: CustomChess;
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
      <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-500 px-2.5 py-1 rounded-full">
        <Swords className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">Checkmate!</span>
      </div>
    );
  }
  // Check for resignation status if available
  if (game.isResigned) {
    const winner = game.resignedColor === "w" ? "Black" : "White";
    return (
      <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-500 px-2.5 py-1 rounded-full">
        <Flag className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">{winner} wins (Resign)</span>
      </div>
    );
  }

  if (game.isCheck()) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 px-2.5 py-1 rounded-full animate-pulse">
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">Check!</span>
      </div>
    );
  }

  if (game.isDraw()) {
    let drawReason = "Draw!";
    if (game.isStalemate()) drawReason = "Stalemate!";
    else if (game.isThreefoldRepetition()) drawReason = "Repetition!";
    else if (game.isInsufficientMaterial())
      drawReason = "Insufficient Material!";
    return (
      <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-500 px-2.5 py-1 rounded-full">
        <HandshakeIcon className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">{drawReason}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-500 px-2.5 py-1 rounded-full">
      <PlayCircle className="h-3.5 w-3.5" />
      <span className="font-semibold text-xs">In Progress</span>
    </div>
  );
};

// Player(s) UI
const PlayerIndicator = ({
  color,
  isActive,
  children,
}: PlayerIndicatorProps) => {
  const baseClasses =
    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300";
  let activeClasses = "";
  let inactiveClasses = "";

  if (color === "w") {
    activeClasses =
      "bg-blue-500/20 text-blue-500 border border-blue-300 shadow-sm";
    inactiveClasses =
      "bg-foreground/5 text-foreground border border-transparent";
  } else {
    activeClasses =
      "bg-red-500/20 text-red-500 border border-red-300 shadow-sm";
    inactiveClasses =
      "bg-foreground/5 text-foreground border border-transparent";
  }

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Crown
        className={`h-4.5 w-4.5 ${
          isActive ? "text-current animate-pulse" : "opacity-60"
        } ${color === "w" ? (isActive ? "fill-blue-500" : "fill-muted-foreground") : isActive ? "fill-red-500" : "fill-muted-foreground"}`}
      />
      <span className="font-medium text-sm">{children}</span>
    </div>
  );
};

const GameControls = ({
  onResign,
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
  handleNewBotDialog,
  onHintRequested,
  isCalculatingHint,
  difficulty,
  selectedBot,
  onNewBot,
}: GameControlsProps) => {
  const router = useRouter();
  const currentTurn = game.turn();
  const isGameOver = game.isGameOver() || game.isResigned;

  // Platform detection for keyboard shortcuts
  const [isMac, setIsMac] = useState(false);

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Detect platform on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+H (Windows/Linux) or Cmd+H (Mac)
      if (event.key.toLowerCase() === "h" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        const isHintEnabled =
          !game.isGameOver() &&
          currentTurn === playerColor &&
          !isCalculatingHint;

        if (isHintEnabled) {
          onHintRequested();
        }
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (canMoveBack && !isGameOver) {
          onMoveBack();
        }
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (canMoveForward && !isGameOver) {
          onMoveForward();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    game,
    currentTurn,
    playerColor,
    isCalculatingHint,
    onHintRequested,
    canMoveBack,
    canMoveForward,
    isGameOver,
    onMoveBack,
    onMoveForward,
  ]);

  const isPlayerWinner = useCallback(() => {
    if (!isGameOver) return false;

    if (game.isCheckmate()) {
      return game.turn() !== playerColor;
    }
    if (game.isResigned && game.resignedColor) {
      return game.resignedColor !== playerColor;
    }
    return false;
  }, [game, playerColor, isGameOver]);

  const findNextHarderBot = useCallback(() => {
    if (!selectedBot) return null;
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
    const currentDifficultyIndex = difficulties.indexOf(difficulty);
    const botsInCurrentDifficulty = BOTS_BY_DIFFICULTY[difficulty];
    const currentBotIndex = botsInCurrentDifficulty.findIndex(
      (bot) => bot.id === selectedBot.id
    );

    if (currentBotIndex < botsInCurrentDifficulty.length - 1) {
      const nextBot = botsInCurrentDifficulty[currentBotIndex + 1];
      return { bot: nextBot, difficulty };
    }
    if (currentDifficultyIndex < difficulties.length - 1) {
      const nextDifficulty = difficulties[currentDifficultyIndex + 1];
      const nextDifficultyBots = BOTS_BY_DIFFICULTY[nextDifficulty];
      if (nextDifficultyBots && nextDifficultyBots.length > 0) {
        return { bot: nextDifficultyBots[0], difficulty: nextDifficulty };
      }
    }
    return null;
  }, [selectedBot, difficulty]);

  const handlePlayNextBot = () => {
    onNewBot();
    const nextBotInfo = findNextHarderBot();
    if (nextBotInfo) {
      router.push(`/play/${nextBotInfo.difficulty}/${nextBotInfo.bot.id}`);
    }
  };

  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current && history.length > 1) {
      try {
        const element = scrollViewportRef.current;
        requestAnimationFrame(() => {
          element.scrollTop = element.scrollHeight;
        });
      } catch (error) {
        console.debug("Scroll error:", error);
      }
    }
  }, [history.length]);

  // Scroll to bottom when history changes, with a small delay
  useEffect(() => {
    if (history.length > 1) {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [history.length, scrollToBottom]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getMoveNumber = (index: number) => Math.ceil((index + 1) / 2);
  const formatMove = (move: { from: string; to: string } | null) =>
    move ? `${move.from}-${move.to}` : "-";

  const getPieceMoved = (fen: string, move: { from: string; to: string }) => {
    const tempGame = new Chess(fen);
    const piece = tempGame.get(move.from as Square);
    return piece ? piece.type : null;
  };

  return (
    <div className="flex flex-col space-y-4 rounded-lg border border-border bg-card p-4 w-full max-h-[calc(100vh-7rem)] laptop-screen:max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent scrollbar-thumb-rounded-full">
      {/* Game Status & Player Indicators */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            Game Status
          </h3>
          <GameStatusIndicator game={game} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <PlayerIndicator
            color="w"
            isActive={currentTurn === "w" && !isGameOver}
          >
            White
          </PlayerIndicator>
          <span className="text-muted-foreground/80 font-semibold text-sm">
            vs
          </span>
          <PlayerIndicator
            color="b"
            isActive={currentTurn === "b" && !isGameOver}
          >
            Black
          </PlayerIndicator>
        </div>
      </div>

      <div className="h-px bg-border/30" />

      {/* Game Timer */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Game Timer</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-mono text-base font-medium text-foreground/90">
              {formatTime(gameTime)}
            </span>
          </div>
          <div className="h-px bg-border/20" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">White:</span>
            <span
              className={`font-mono text-base font-medium ${
                currentTurn === "w" && !game.isGameOver()
                  ? "text-blue-500 animate-pulse"
                  : "text-foreground/90"
              }`}
            >
              {formatTime(whiteTime)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Black:</span>
            <span
              className={`font-mono text-base font-medium ${
                currentTurn === "b" && !game.isGameOver()
                  ? "text-red-500 animate-pulse"
                  : "text-foreground/90"
              }`}
            >
              {formatTime(blackTime)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/30" />

      {/* Move History */}
      <div className="flex flex-col flex-grow min-h-0 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Move History</h3>
        <div
          ref={scrollViewportRef}
          className="flex-grow w-full rounded-lg border border-border/30 bg-background/50 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent scrollbar-thumb-rounded-full h-[300px] sm:h-[400px] md:h-[350px] lg:h-[420px] xl:h-[450px] laptop-screen:h-[calc(100vh-510px)] overflow-y-auto"
        >
          <div className="p-2.5 space-y-1">
            {history.length <= 1 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                No moves yet.
              </p>
            )}
            {history.slice(1).map((historyItem, index) => {
              const pieceType = historyItem.lastMove
                ? getPieceMoved(history[index].fen, historyItem.lastMove)
                : null;
              const isLatestMove = index === history.length - 2;
              const isWhiteMove = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`flex items-center text-xs sm:text-sm rounded-lg transition-colors duration-150 ${
                    isWhiteMove
                      ? "bg-foreground/5 hover:bg-foreground/10"
                      : "hover:bg-foreground/5"
                  } ${isLatestMove ? (isWhiteMove ? "!bg-blue-500/15" : "!bg-red-500/15") : ""}`}
                >
                  <div className="flex items-center w-full">
                    <span className="text-muted-foreground/70 w-5 sm:w-6 text-right mr-2 sm:mr-3 pl-1 tabular-nums">
                      {getMoveNumber(index)}.
                    </span>
                    <div
                      className={`flex items-center gap-1.5 w-full py-1 pr-1.5 ${
                        isLatestMove
                          ? isWhiteMove
                            ? "text-blue-500"
                            : "text-red-500"
                          : isWhiteMove
                            ? "text-blue-500/80"
                            : "text-red-500/80"
                      } ${isLatestMove ? "font-semibold" : "font-normal"}`}
                    >
                      <div className="flex-1 flex items-center">
                        <span
                          className={`px-1 rounded-[3px] ${
                            isLatestMove
                              ? isWhiteMove
                                ? "bg-blue-500/25"
                                : "bg-red-500/25"
                              : ""
                          }`}
                        >
                          {formatMove(historyItem.lastMove)}
                        </span>
                      </div>
                      {pieceType && (
                        <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center opacity-80 brightness-0 invert-[0.25] dark:brightness-0 dark:invert [.fantasy_&]:invert [.amethyst_&]:invert [.crimson_&]:invert [.jade_&]:invert [.amber_&]:invert [.rose_&]:invert [.cyberpunk_&]:invert [.dracula_&]:invert [.midnight_&]:invert">
                          <Piece
                            type={pieceType.toUpperCase()}
                            pieceSet={pieceSet}
                            variant="symbol"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-border/30" />

      {/* Game Controls */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Game Controls</h3>
        {/* Move Controls */}
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="default"
            onClick={onMoveBack}
            disabled={!canMoveBack || isGameOver}
            className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
            aria-label="Previous move"
            title="Previous move (←)"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="flex items-center gap-1">
              Back
              <span className="hidden sm:inline text-xs opacity-75 ml-1">
                ←
              </span>
            </span>
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={onMoveForward}
            disabled={!canMoveForward || isGameOver}
            className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
            aria-label="Next move"
            title="Next move (→)"
          >
            <span className="flex items-center gap-1">
              Forward
              <span className="hidden sm:inline text-xs opacity-75 ml-1">
                →
              </span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-px bg-border/20 my-1.5"></div>

        {/* Primary Action Buttons */}
        <div className="space-y-2">
          {isGameOver && isPlayerWinner() && selectedBot && (
            <>
              <div className="my-3 text-center space-y-1">
                <span className="text-xs text-muted-foreground">
                  Ready for a tougher opponent?
                </span>
                {(() => {
                  const nextBotInfo = findNextHarderBot();
                  if (nextBotInfo) {
                    return (
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-xs">
                        <Avatar className="h-4 w-4">
                          <AvatarImage
                            src={nextBotInfo.bot.image}
                            alt={nextBotInfo.bot.name}
                          />
                          <AvatarFallback className="text-xs">
                            {nextBotInfo.bot.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground/90">
                          {nextBotInfo.bot.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-1.5 py-0.5",
                            nextBotInfo.difficulty.toLowerCase() ===
                              "beginner" &&
                              "difficulty-beginner-bg difficulty-beginner-text difficulty-beginner-border",
                            nextBotInfo.difficulty.toLowerCase() === "easy" &&
                              "difficulty-easy-bg difficulty-easy-text difficulty-easy-border",
                            nextBotInfo.difficulty.toLowerCase() ===
                              "intermediate" &&
                              "difficulty-intermediate-bg difficulty-intermediate-text difficulty-intermediate-border",
                            nextBotInfo.difficulty.toLowerCase() ===
                              "advanced" &&
                              "difficulty-advanced-bg difficulty-advanced-text difficulty-advanced-border",
                            nextBotInfo.difficulty.toLowerCase() === "hard" &&
                              "difficulty-hard-bg difficulty-hard-text difficulty-hard-border",
                            nextBotInfo.difficulty.toLowerCase() === "expert" &&
                              "difficulty-expert-bg difficulty-expert-text difficulty-expert-border",
                            nextBotInfo.difficulty.toLowerCase() === "master" &&
                              "difficulty-master-bg difficulty-master-text difficulty-master-border",
                            nextBotInfo.difficulty.toLowerCase() ===
                              "grandmaster" &&
                              "difficulty-grandmaster-bg difficulty-grandmaster-text difficulty-grandmaster-border"
                          )}
                        >
                          {nextBotInfo.difficulty.charAt(0).toUpperCase() +
                            nextBotInfo.difficulty.slice(1).toLowerCase()}
                        </Badge>
                        <EloBadge elo={nextBotInfo.bot.rating} />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <Button
                onClick={handlePlayNextBot}
                variant="default"
                className="w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                aria-label="Play next challenger"
              >
                <TrendingUp className="h-4 w-4" />
                Next Challenger
              </Button>
            </>
          )}

          <div className="flex gap-2.5">
            {!isGameOver && (
              <Button
                onClick={onHintRequested}
                variant="outline"
                disabled={
                  game.isGameOver() ||
                  currentTurn !== playerColor ||
                  isCalculatingHint
                }
                className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300 disabled:opacity-70 disabled:bg-fuchsia-500/5 disabled:text-fuchsia-500/50 disabled:border-fuchsia-500/20"
                aria-label="Get a hint"
                title={`Get a hint (${isMac ? "⌘" : "Ctrl"}+H)`}
              >
                <Lightbulb
                  className={`h-4 w-4 ${
                    isCalculatingHint
                      ? "animate-ping opacity-50"
                      : "text-fuchsia-400"
                  }`}
                />
                <span className="flex items-center gap-1">
                  {isCalculatingHint ? (
                    <div className="h-4 w-4 border-2 border-fuchsia-400/50 border-t-fuchsia-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      Hint
                      <span className="hidden sm:inline text-xs opacity-75 ml-1">
                        {isMac ? "⌘H" : "Ctrl+H"}
                      </span>
                    </>
                  )}
                </span>
              </Button>
            )}

            {isGameOver ? (
              <Button
                onClick={onRematch}
                variant="outline"
                className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                aria-label="Rematch game"
              >
                <HandshakeIcon className="h-4 w-4" />
                Rematch
              </Button>
            ) : (
              <Button
                onClick={onResign}
                variant="destructive"
                className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
                aria-label="Resign game"
              >
                <Flag className="h-4 w-4" />
                Resign
              </Button>
            )}
          </div>

          <Button
            onClick={handleNewBotDialog}
            variant="outline"
            className="w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
            aria-label="Select new bot"
          >
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            New Bot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
