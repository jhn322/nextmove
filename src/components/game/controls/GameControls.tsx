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
  Trophy,
  Play,
  RotateCcw,
} from "lucide-react";
import { BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { useRouter } from "next/navigation";
import { Bot } from "@/components/game/data/bots";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EloBadge from "@/components/ui/elo-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { resetUserProgressAction } from "@/lib/actions/game.actions";
import { useAuth } from "@/context/auth-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  beatenBots?: Array<{ name: string; difficulty: string; id: number }>;
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
  beatenBots = [],
}: GameControlsProps) => {
  const router = useRouter();
  const { session, refreshSession } = useAuth();
  const currentTurn = game.turn();
  const isGameOver = game.isGameOver() || game.isResigned;
  const [isResettingProgress, setIsResettingProgress] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);

  // Platform detection for keyboard shortcuts
  const [isMac, setIsMac] = useState(false);

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Detect platform on mount and check replay mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
      const replayMode = localStorage.getItem("chess-replay-mode");
      setIsReplayMode(replayMode === "true");
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

    // Helper function to check if a bot is already beaten
    const isBotBeaten = (botName: string) => {
      return beatenBots.some((beaten) => beaten.name === botName);
    };

    // Find current difficulty index
    const currentDifficultyIndex = difficulties.indexOf(difficulty);

    // Get all bots in the current difficulty
    const botsInCurrentDifficulty = BOTS_BY_DIFFICULTY[difficulty];

    // Find the current bot's index
    const currentBotIndex = botsInCurrentDifficulty.findIndex(
      (bot) => bot.id === selectedBot.id
    );

    // Look for the next unbeaten bot in the same difficulty (after current bot)
    for (let i = currentBotIndex + 1; i < botsInCurrentDifficulty.length; i++) {
      const nextBot = botsInCurrentDifficulty[i];
      if (!isBotBeaten(nextBot.name)) {
        return { bot: nextBot, difficulty };
      }
    }

    // If no unbeaten bot in current difficulty, move to next difficulties
    for (
      let diffIndex = currentDifficultyIndex + 1;
      diffIndex < difficulties.length;
      diffIndex++
    ) {
      const nextDifficulty = difficulties[diffIndex];
      const nextDifficultyBots = BOTS_BY_DIFFICULTY[nextDifficulty];
      if (nextDifficultyBots && nextDifficultyBots.length > 0) {
        // Find the first unbeaten bot in this difficulty
        const firstUnbeatenBot = nextDifficultyBots.find(
          (bot) => !isBotBeaten(bot.name)
        );
        if (firstUnbeatenBot) {
          return { bot: firstUnbeatenBot, difficulty: nextDifficulty };
        }
      }
    }

    return null;
  }, [selectedBot, difficulty, beatenBots]);

  // Check if all bots are beaten
  const getAllBots = useCallback(() => {
    const allBots: Array<Bot & { difficulty: string }> = [];
    Object.keys(BOTS_BY_DIFFICULTY).forEach((difficulty) => {
      BOTS_BY_DIFFICULTY[difficulty as keyof typeof BOTS_BY_DIFFICULTY].forEach(
        (bot) => {
          allBots.push({
            ...bot,
            difficulty,
          });
        }
      );
    });
    return allBots;
  }, []);

  const allBots = getAllBots();
  const allBotsBeaten =
    beatenBots.length >= allBots.length && allBots.length > 0;

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

  // Handle replay journey - keep progress
  const handleReplayJourney = () => {
    onNewBot();
    // Set replay mode flag
    if (typeof window !== "undefined") {
      localStorage.setItem("chess-replay-mode", "true");
    }
    router.push("/play/beginner");
  };

  // Handle reset all progress - true restart
  const handleResetProgress = async () => {
    if (!session?.user?.id) return;

    setIsResettingProgress(true);
    try {
      const success = await resetUserProgressAction(session.user.id);
      if (success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("chess-game-state");
          localStorage.removeItem("selectedBot");
          localStorage.removeItem("last-saved-game-id");
          localStorage.removeItem("last-saved-game-fen");
          localStorage.removeItem("chess-game-history");
          localStorage.removeItem("chess-game-stats");
          localStorage.removeItem("chess-last-game-result");
          localStorage.removeItem("chess-replay-mode");
        }

        // Refresh session to get updated user data
        await refreshSession();

        onNewBot();
        router.push("/play/beginner");
      }
    } catch (error) {
      console.error("Error resetting progress:", error);
    } finally {
      setIsResettingProgress(false);
      setShowResetConfirmDialog(false);
    }
  };

  // Handle random opponent selection
  const handleRandomOpponent = () => {
    onNewBot();

    // Get a random bot from all available bots
    const allBots: Array<Bot & { difficulty: string }> = [];
    Object.keys(BOTS_BY_DIFFICULTY).forEach((difficulty) => {
      BOTS_BY_DIFFICULTY[difficulty as keyof typeof BOTS_BY_DIFFICULTY].forEach(
        (bot) => {
          allBots.push({
            ...bot,
            difficulty,
          });
        }
      );
    });

    const randomBot = allBots[Math.floor(Math.random() * allBots.length)];
    router.push(`/play/${randomBot.difficulty}/${randomBot.id}`);
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
            Back
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
            Forward
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-px bg-border/20 my-1.5"></div>

        {/* Primary Action Buttons */}
        <div className="space-y-2">
          {isGameOver && isPlayerWinner() && selectedBot && (
            <>
              {allBotsBeaten ? (
                // Different UI based on replay mode
                isReplayMode ? (
                  // In replay mode - show Random Opponent button
                  <Button
                    onClick={handleRandomOpponent}
                    variant="default"
                    className="w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    aria-label="Challenge a random opponent"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Random Opponent
                  </Button>
                ) : (
                  // First time completion - show congratulations and choice
                  <div className="my-3 text-center space-y-3 py-4">
                    <div className="bg-primary/10 p-3 rounded-full inline-block">
                      <Trophy className="h-6 w-6 text-primary animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary">
                        🎉 Congratulations! 🎉
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You&apos;ve defeated all 48 bots! What&apos;s next?
                      </p>
                    </div>
                    <div className="space-y-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleReplayJourney}
                              variant="default"
                              className="w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                              aria-label="Replay journey keeping your current progress"
                            >
                              <Play className="h-4 w-4" />
                              Replay Journey
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Start playing again while keeping all your game
                              history and progression
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => setShowResetConfirmDialog(true)}
                              disabled={isResettingProgress}
                              variant="outline"
                              className="w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                              aria-label="Reset all progress and start completely fresh"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Start Fresh
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Clear all chess progress, ELO, and game history to
                              start the bot challenge fresh
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )
              ) : (
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
                                nextBotInfo.difficulty.toLowerCase() ===
                                  "easy" &&
                                  "difficulty-easy-bg difficulty-easy-text difficulty-easy-border",
                                nextBotInfo.difficulty.toLowerCase() ===
                                  "intermediate" &&
                                  "difficulty-intermediate-bg difficulty-intermediate-text difficulty-intermediate-border",
                                nextBotInfo.difficulty.toLowerCase() ===
                                  "advanced" &&
                                  "difficulty-advanced-bg difficulty-advanced-text difficulty-advanced-border",
                                nextBotInfo.difficulty.toLowerCase() ===
                                  "hard" &&
                                  "difficulty-hard-bg difficulty-hard-text difficulty-hard-border",
                                nextBotInfo.difficulty.toLowerCase() ===
                                  "expert" &&
                                  "difficulty-expert-bg difficulty-expert-text difficulty-expert-border",
                                nextBotInfo.difficulty.toLowerCase() ===
                                  "master" &&
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

      {/* Reset Progress Confirmation Dialog */}
      <AlertDialog
        open={showResetConfirmDialog}
        onOpenChange={setShowResetConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Chess Progress</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>
                This will permanently delete <strong>ALL</strong> of your chess
                progress:
              </div>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Game History</strong> - All past chess games
                </li>
                <li>
                  <strong>ELO Rating</strong> - Reset back to starting value
                </li>
                <li>
                  <strong>Bot Challenge Records</strong> - All bots you&apos;ve
                  defeated
                </li>
                <li>
                  <strong>Game Statistics</strong> - Win/loss records and
                  averages
                </li>
              </ul>
              <div className="text-destructive font-semibold mt-2">
                This action cannot be undone! Your Chess Wordle statistics will
                not be affected.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetProgress}
              disabled={isResettingProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResettingProgress
                ? "Resetting..."
                : "Reset All Chess Progress"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameControls;
