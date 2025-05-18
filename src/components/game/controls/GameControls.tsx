import { useEffect, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { useRouter } from "next/navigation";
import { Bot } from "@/components/game/data/bots";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EloBadge from "@/components/ui/elo-badge";

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
      <div className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full">
        <Swords className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">Checkmate!</span>
      </div>
    );
  }
  // Check for resignation status if available
  if (game.isResigned) {
    const winner = game.resignedColor === "w" ? "Black" : "White";
    return (
      <div className="inline-flex items-center gap-1.5 bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-full">
        <Flag className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">{winner} wins (Resign)</span>
      </div>
    );
  }

  if (game.isCheck()) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-yellow-500/15 text-yellow-400 px-2.5 py-1 rounded-full animate-pulse">
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
      <div className="inline-flex items-center gap-1.5 bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full">
        <HandshakeIcon className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">{drawReason}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full">
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
    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300";
  let activeClasses = "";
  let inactiveClasses = "";

  if (color === "w") {
    activeClasses =
      "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm";
    inactiveClasses =
      "bg-foreground/5 text-muted-foreground/70 border border-transparent";
  } else {
    activeClasses =
      "bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm";
    inactiveClasses =
      "bg-foreground/5 text-muted-foreground/70 border border-transparent";
  }

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Crown
        className={`h-4.5 w-4.5 ${
          isActive ? "text-current animate-pulse" : "opacity-60"
        } ${color === "w" ? (isActive ? "fill-blue-400" : "fill-muted-foreground") : isActive ? "fill-red-400" : "fill-muted-foreground"}`}
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

  useEffect(() => {
    const scrollViewport = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (scrollViewport) {
      const hasScrollbar =
        scrollViewport.scrollHeight > scrollViewport.clientHeight;
      if (hasScrollbar) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [history.length]);

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
                  ? "text-blue-400 animate-pulse"
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
                  ? "text-red-400 animate-pulse"
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
        <ScrollArea className="flex-grow w-full rounded-md border border-border/30 bg-background/50 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent scrollbar-thumb-rounded-full h-[300px] sm:h-[400px] md:h-[350px] lg:h-[420px] xl:h-[450px] laptop-screen:h-[calc(100vh-510px)]">
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
                  className={`flex items-center text-xs sm:text-sm rounded-sm transition-colors duration-150 ${
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
                            ? "text-blue-300"
                            : "text-red-300"
                          : isWhiteMove
                            ? "text-blue-400/90"
                            : "text-red-400/90"
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
                        <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center opacity-80 brightness-0 dark:brightness-0 dark:invert">
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
        </ScrollArea>
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
              <div className="my-3 text-center space-y-1">
                <span className="text-xs text-muted-foreground">
                  Ready for a tougher challenge?
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
                        <span className="px-1.5 py-0.5 bg-blue-500/15 text-blue-400 rounded-full capitalize">
                          {nextBotInfo.difficulty}
                        </span>
                        <EloBadge elo={nextBotInfo.bot.rating} />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handlePlayNextBot}
                      variant="default"
                      className="w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      aria-label="Play next challenge"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Next Challenge
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Face the next stronger, more skilled bot in The Ultimate
                      Chess Challenge.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          <div className="flex gap-2.5">
            {!isGameOver && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                    >
                      <Lightbulb
                        className={`h-4 w-4 ${
                          isCalculatingHint
                            ? "animate-ping opacity-50"
                            : "text-fuchsia-400"
                        }`}
                      />
                      {isCalculatingHint ? (
                        <div className="h-4 w-4 border-2 border-fuchsia-400/50 border-t-fuchsia-400 rounded-full animate-spin" />
                      ) : (
                        "Hint"
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get a suggestion for your next move.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {isGameOver ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onRematch}
                      variant="outline"
                      className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                      aria-label="Rematch game"
                    >
                      <HandshakeIcon className="h-4 w-4" />
                      Rematch
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Play again versus the same bot and settings.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onResign}
                      variant="destructive"
                      className="flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
                      aria-label="Resign game"
                    >
                      <Flag className="h-4 w-4" />
                      Resign
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Forfeit the current game.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNewBotDialog}
                  variant="outline"
                  className="w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                  aria-label="Select new bot"
                >
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  New Bot
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose a different bot to play against and settings.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
