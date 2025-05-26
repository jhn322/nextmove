import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Bot, BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { useWindowSize } from "react-use";
import { Button } from "@/components/ui/button";
import { HandshakeIcon, UserPlus, TrendingUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Chess } from "chess.js";
import Confetti from "react-confetti";
import { saveGameAction } from "@/lib/actions/game.actions";
import { useAuth } from "@/context/auth-context";
import { getConfettiEnabled } from "@/lib/settings";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EloBadge from "@/components/ui/elo-badge";

const VICTORY_MESSAGES = [
  "Brilliant moves! Sweet victory!",
  "Checkmate! You're a tactical genius!",
  "The perfect strategy! Well played!",
  "Masterful play! The bot never stood a chance!",
  "Amazing win! Your chess skills are impressive!",
];

const DEFEAT_MESSAGES = [
  "You'll get them next time!",
  "A tough match! Keep practicing!",
  "So close! Learn from this and come back stronger!",
  "The bot got lucky this time!",
  "A challenging opponent! Ready for a rematch?",
];

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRematch: () => void;
  onNewBot: () => void;
  game: Chess;
  difficulty: string;
  isResignation?: boolean;
  onConfirmResign?: (game: Chess) => void;
  playerColor: "w" | "b";
  handleNewBotDialog: () => void;
  selectedBot: Bot | null;
  playerName: string;
  gameTime: number;
  movesCount: number;
}

const VictoryModal = ({
  isOpen,
  onClose,
  onRematch,
  game,
  difficulty,
  isResignation = false,
  onConfirmResign,
  playerColor,
  onNewBot,
  selectedBot,
  playerName: defaultPlayerName,
  gameTime,
  movesCount,
}: VictoryModalProps) => {
  const router = useRouter();
  const [message, setMessage] = useState<string | React.ReactNode>("");
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRecycling, setIsRecycling] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");
  const [defeatMessage, setDefeatMessage] = useState("");
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [playerAvatar, setPlayerAvatar] = useState("/default-pfp.webp");
  const [resultSaved, setResultSaved] = useState(false);
  const { session, refreshSession } = useAuth();
  const [gameEloDelta, setGameEloDelta] = useState<number | null>(null);
  const [gameNewElo, setGameNewElo] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPlayerWinner = useCallback(() => {
    if (game.isCheckmate()) {
      const losingColor = game.turn() === "w" ? "w" : "b";
      const winningColor = losingColor === "w" ? "b" : "w";
      return winningColor === playerColor;
    }
    if (isResignation || game.isResigned) {
      return false;
    }
    return false;
  }, [game, playerColor, isResignation]);

  // Generate a unique game ID based on current state to prevent duplicate saves
  const gameStateId = useMemo(() => {
    if (!game || !selectedBot) return "";

    // Create a stable ID that doesn't change on refresh
    // Include the result (win/loss/draw) in the ID to distinguish between different outcomes with the same board position
    const result = isPlayerWinner() ? "win" : game.isDraw() ? "draw" : "loss";
    return `${game.fen()}_${
      selectedBot.name
    }_${playerColor}_${difficulty}_${result}`;
  }, [game, selectedBot, playerColor, difficulty, isPlayerWinner]);

  // Load player data from localStorage and check if this game has already been saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlayerName = localStorage.getItem("chess-player-name");
      const savedAvatarUrl = localStorage.getItem("chess-player-avatar");

      if (savedPlayerName) {
        setPlayerName(savedPlayerName);
      }

      if (savedAvatarUrl) {
        setPlayerAvatar(savedAvatarUrl);
      }

      // Check if this exact game result has already been saved
      // Use both FEN and the gameStateId which includes the result
      const savedGameId = localStorage.getItem("last-saved-game-id");
      const savedGameFen = localStorage.getItem("last-saved-game-fen");

      // Only consider a game saved if both FEN and game ID match
      if (savedGameId === gameStateId && savedGameFen === game.fen()) {
        console.log("Game result already saved, preventing duplicate save");
        setResultSaved(true);
      } else {
        // Reset resultSaved when viewing a new game state
        setResultSaved(false);
        setGameEloDelta(null);
        setGameNewElo(null);
      }
    }
  }, [game, gameStateId, isOpen]);

  const renderWinnerText = useCallback(() => {
    let baseMessageText: string;

    if (isResignation) {
      baseMessageText = "Are you sure you want to resign?";
    } else if (game.isDraw()) {
      if (game.isStalemate()) baseMessageText = "Stalemate - game is a draw!";
      else if (game.isThreefoldRepetition())
        baseMessageText = "Draw by repetition!";
      else if (game.isInsufficientMaterial())
        baseMessageText = "Draw by insufficient material!";
      else baseMessageText = "Game is a draw!";
    } else if (game.isCheckmate() || (game.isResigned && !isResignation)) {
      // Handle checkmate or bot resignation
      const isWinner = isPlayerWinner();
      const winnerName = isWinner ? "You" : selectedBot?.name || "Bot";
      const endMessage = isWinner ? victoryMessage : defeatMessage;
      baseMessageText = `${winnerName} won! ${endMessage}`;
    } else {
      // Player initiated resignation (after confirm), or other unhandled game end states
      baseMessageText = `${selectedBot?.name || "Bot"} won by resignation!`;
    }

    return baseMessageText;
  }, [
    game,
    isResignation,
    selectedBot,
    victoryMessage,
    defeatMessage,
    isPlayerWinner,
  ]);

  // Save game result to database and update ELO state
  useEffect(() => {
    const saveResultAndUpdateEloInternal = async () => {
      if (isOpen && session?.user?.id && !resultSaved && gameStateId) {
        const isEffectivelyOver = game.isGameOver() || game.isResigned === true;

        if (isEffectivelyOver) {
          try {
            const gameSaveResponse = await saveGameAction({
              userId: session.user.id,
              fen: game.fen(),
              pgnHistory: game.history({ verbose: false }),
              difficulty,
              playerColor,
              selectedBot,
              gameTime,
              movesCount,
              isResignation: game.isResigned === true,
            });

            if (gameSaveResponse) {
              setResultSaved(true);
              localStorage.setItem("last-saved-game-id", gameStateId);
              localStorage.setItem("last-saved-game-fen", game.fen());
              localStorage.setItem(
                "last-saved-game-result",
                gameSaveResponse.result
              );

              setGameEloDelta(gameSaveResponse.eloDelta);
              setGameNewElo(gameSaveResponse.newElo);

              await refreshSession();

              if (typeof window !== "undefined") {
                localStorage.removeItem("chess-game-state");
                localStorage.removeItem("selectedBot");
              }
            } else {
              console.error(
                "VictoryModal: Failed to save game or get ELO update from action."
              );
            }
          } catch (error) {
            console.error("Error saving game result and updating ELO:", error);
          }
        }
      }
    };

    saveResultAndUpdateEloInternal();
  }, [
    isOpen,
    session,
    resultSaved,
    game,
    gameStateId,
    difficulty,
    playerColor,
    selectedBot,
    gameTime,
    movesCount,
    refreshSession,
    isResignation,
  ]);

  useEffect(() => {
    if (isOpen) {
      const randomVictoryIndex = Math.floor(
        Math.random() * VICTORY_MESSAGES.length
      );
      const randomDefeatIndex = Math.floor(
        Math.random() * DEFEAT_MESSAGES.length
      );
      setVictoryMessage(VICTORY_MESSAGES[randomVictoryIndex]);
      setDefeatMessage(DEFEAT_MESSAGES[randomDefeatIndex]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessage(renderWinnerText());
      const shouldShowConfetti = isPlayerWinner() && getConfettiEnabled();
      setShowConfetti(shouldShowConfetti);
      setIsRecycling(shouldShowConfetti);

      if (shouldShowConfetti) {
        // Stop confetti after 5 seconds
        const timer = setTimeout(() => {
          setIsRecycling(false);
          // Give time for remaining confetti to fall before hiding
          setTimeout(() => {
            setShowConfetti(false);
          }, 2000);
        }, 5000);

        return () => {
          clearTimeout(timer);
          setShowConfetti(false);
          setIsRecycling(false);
        };
      }
    }
  }, [
    isOpen,
    game,
    isResignation,
    playerColor,
    selectedBot,
    victoryMessage,
    defeatMessage,
    isPlayerWinner,
    renderWinnerText,
  ]);

  useEffect(() => {
    if (isOpen) {
      if (isResignation) {
        setIsVisible(true);
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current);
          delayTimeoutRef.current = null;
        }
      } else {
        delayTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 600);
      }
    } else {
      setIsVisible(false);
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    }
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    };
  }, [isOpen, isResignation]);

  const handleRematch = () => {
    game.reset();
    game.isResigned = false;
    onRematch();
  };

  const handleNewBot = () => {
    game.reset();
    game.isResigned = false;
    onNewBot();
  };

  // Function to find the next harder bot
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

    // Find current difficulty index
    const currentDifficultyIndex = difficulties.indexOf(difficulty);

    // Get all bots in the current difficulty
    const botsInCurrentDifficulty = BOTS_BY_DIFFICULTY[difficulty];

    // Find the current bot's index
    const currentBotIndex = botsInCurrentDifficulty.findIndex(
      (bot) => bot.id === selectedBot.id
    );

    // If there's a next bot in the same difficulty
    if (currentBotIndex < botsInCurrentDifficulty.length - 1) {
      const nextBot = botsInCurrentDifficulty[currentBotIndex + 1];
      return { bot: nextBot, difficulty };
    }

    // If we need to move to the next difficulty
    if (currentDifficultyIndex < difficulties.length - 1) {
      const nextDifficulty = difficulties[currentDifficultyIndex + 1];
      const nextDifficultyBots = BOTS_BY_DIFFICULTY[nextDifficulty];
      if (nextDifficultyBots && nextDifficultyBots.length > 0) {
        return { bot: nextDifficultyBots[0], difficulty: nextDifficulty };
      }
    }

    return null;
  }, [selectedBot, difficulty]);

  // Handle navigation to the next harder bot
  const handlePlayNextBot = () => {
    // Reset all game state (captured pieces, history, etc.) via onNewBot
    onNewBot();

    onClose();

    const nextBotInfo = findNextHarderBot();
    if (nextBotInfo) {
      router.push(`/play/${nextBotInfo.difficulty}/${nextBotInfo.bot.id}`);
    }
  };

  return (
    <>
      {isVisible && showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={isRecycling}
          numberOfPieces={400}
          gravity={0.1}
          style={{ position: "fixed", zIndex: 100 }}
        />
      )}
      <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-md w-[95%] mx-auto p-4 sm:p-6 rounded-lg border bg-background shadow-2xl backdrop-blur-md"
          aria-describedby="victory-modal-description"
          overlayClassName={!isResignation ? "bg-black/40" : undefined}
        >
          <DialogDescription id="victory-modal-description" className="sr-only">
            {isResignation
              ? "Confirm if you want to resign from the current game."
              : game.isDraw()
                ? "The game ended in a draw."
                : game.isCheckmate()
                  ? `Game over by checkmate. ${
                      isPlayerWinner() ? "You won!" : "Bot won!"
                    }`
                  : "Game results and options for your next move."}
          </DialogDescription>

          <DialogHeader>
            <DialogTitle className="text-center text-xl sm:text-2xl font-bold mb-2">
              {message}
            </DialogTitle>
            {!isResignation &&
              typeof gameEloDelta === "number" &&
              gameEloDelta !== 0 && (
                <div className="flex justify-center mt-1 gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg font-semibold text-sm ${gameEloDelta > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    ELO {gameEloDelta > 0 ? "+" : ""}
                    {gameEloDelta}
                  </span>
                  {typeof gameNewElo === "number" && (
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-muted text-white">
                      New ELO: {gameNewElo}
                    </span>
                  )}
                </div>
              )}
            {!isResignation && (
              <div className="text-center text-muted-foreground text-sm mt-2">
                <span className="capitalize">{difficulty} Difficulty</span>
                <span className="mx-2">·</span>
                <span>{movesCount} moves</span>
                <span className="mx-2">·</span>
                <span>
                  {Math.floor(gameTime / 60)}:
                  {(gameTime % 60).toString().padStart(2, "0")} min
                </span>
              </div>
            )}
          </DialogHeader>

          {/* Player vs Bot Card Layout */}
          {!isResignation && (
            <div className="flex flex-row items-center justify-center gap-6 mt-2">
              {/* Player Card */}
              <div className="flex flex-col items-center bg-muted/40 rounded-lg p-4 shadow w-32 min-h-[7.5rem]">
                <Avatar className="h-10 w-10 sm:h-14 sm:w-14 rounded-full">
                  <AvatarImage src={playerAvatar} alt={playerName} />
                  <AvatarFallback>{playerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span
                  className="mt-2 font-semibold text-base text-foreground break-words text-center w-full"
                  title={playerName}
                >
                  {playerName}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {playerColor === "w" ? "White" : "Black"}
                </span>
              </div>
              <span className="text-lg font-bold text-muted-foreground select-none">
                VS
              </span>
              {/* Bot Card */}
              <div className="flex flex-col items-center bg-muted/40 rounded-lg p-4 shadow w-32 min-h-[7.5rem]">
                <Avatar className="h-10 w-10 sm:h-14 sm:w-14 rounded-full">
                  <AvatarImage
                    src={selectedBot?.image}
                    alt={selectedBot?.name}
                  />
                  <AvatarFallback title={selectedBot?.name}>B</AvatarFallback>
                </Avatar>
                <span
                  className="mt-2 font-semibold text-base text-foreground break-words text-center w-full"
                  title={selectedBot?.name}
                >
                  {selectedBot?.name || "Bot"}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {playerColor === "w" ? "Black" : "White"}
                </span>
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-col gap-3">
            {isResignation ? (
              <>
                <Button
                  onClick={() => onConfirmResign?.(game)}
                  variant="destructive"
                  className="flex-1 text-sm sm:text-base py-2 h-auto"
                  aria-label="Confirm resignation"
                >
                  Confirm
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-2 h-auto"
                  aria-label="Cancel resignation"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {/* Next Bot button only when player wins */}
                {isPlayerWinner() && !game.isDraw() && (
                  <>
                    <div className="mb-2 text-center">
                      <span className="text-sm text-muted-foreground">
                        Ready for a tougher challenge?
                      </span>
                      {(() => {
                        const nextBotInfo = findNextHarderBot();
                        if (nextBotInfo) {
                          return (
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={nextBotInfo.bot.image}
                                  alt={nextBotInfo.bot.name}
                                />
                                <AvatarFallback title={nextBotInfo.bot.name}>
                                  B
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {nextBotInfo.bot.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full capitalize">
                                {nextBotInfo.difficulty}
                              </span>
                              <EloBadge elo={nextBotInfo.bot.rating} />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handlePlayNextBot}
                            variant="default"
                            className="w-full text-base py-2 h-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg font-semibold flex items-center justify-center gap-2 rounded-lg"
                            aria-label="Next Challenge"
                          >
                            <TrendingUp className="h-5 w-5" />
                            Next Challenge
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Face the next stronger, more skilled bot in The
                            Ultimate Chess Challenge.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
                <div className="flex gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleRematch}
                          variant="outline"
                          className="flex-1 text-base py-2 h-auto border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400 font-medium flex items-center justify-center gap-2 rounded-lg"
                          aria-label="Rematch"
                        >
                          <HandshakeIcon className="h-5 w-5" />
                          Rematch
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Play again versus the same bot and settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleNewBot}
                          variant="outline"
                          className="flex-1 text-base py-2 h-auto font-medium flex items-center justify-center gap-2 rounded-lg"
                          aria-label="New Bot"
                        >
                          <UserPlus className="h-5 w-5" />
                          New Bot
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Choose a different bot to play against and settings
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VictoryModal;
