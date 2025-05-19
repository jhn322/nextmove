"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Trophy,
  X,
  Minus,
  Clock,
  History,
  AlertCircle,
  BarChart3,
  Calendar,
  Timer,
  CheckCircle2,
  Gamepad2,
  Footprints,
  Medal,
  Bot as BotIcon,
  Trash2,
  Flag,
  Loader2,
  Activity,
  ToyBrick,
  TrendingUp,
  Award,
  PieChart,
  Play,
  Hourglass,
  ChartColumnStacked,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BOTS_BY_DIFFICULTY, Bot } from "@/components/game/data/bots";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { type GameHistory as PrismaGameHistory } from "@/lib/game-service";
import { clearUserGameHistoryAction } from "@/lib/actions/game.actions";
import { Session } from "next-auth";
import Link from "next/link";
import { DEFAULT_STATE } from "@/config/game";
import { type GameStats } from "@/types/stats";
import { type UserWordleStats } from "@/types/wordle";
import { getUserWordleStatsAction } from "@/lib/actions/wordle.actions";
import EloBadge from "@/components/ui/elo-badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ExtendedGameHistory extends PrismaGameHistory {
  eloDelta: number | null;
  newElo: number | null;
}

interface HistoryPageClientProps {
  session: Session | null;
  initialGameHistory: ExtendedGameHistory[];
  initialGameStats: GameStats | null;
  initialError?: string;
  serverMessage?: string;
}

// Constant for game state in localStorage
const GAME_STATE_STORAGE_KEY = "chess-game-state";
const SELECTED_BOT_STORAGE_KEY = "selectedBot";

//** Pagination */
const PAGE_SIZE = 25;

export const HistoryPageClient = ({
  session,
  initialGameHistory,
  initialGameStats,
  initialError,
  serverMessage,
}: HistoryPageClientProps) => {
  const [gameHistory, setGameHistory] =
    useState<ExtendedGameHistory[]>(initialGameHistory);
  const [gameStats, setGameStats] = useState<GameStats | null>(
    initialGameStats
  );
  const [infoMessage, setInfoMessage] = useState(serverMessage || "");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(initialError || null);
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  // State for new game confirmation dialog
  const [showStartNewGameDialog, setShowStartNewGameDialog] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<{
    href: string;
    botId: number;
  } | null>(null);

  // State for tracking the specific active bot game
  const [activeBotGameId, setActiveBotGameId] = useState<
    string | number | null
  >(null);
  const [activeBotGameDifficulty, setActiveBotGameDifficulty] = useState<
    string | null
  >(null);
  const [isAnyGameActive, setIsAnyGameActive] = useState<boolean>(false);

  // State for spinner on bot cards
  const [navigatingToBotId, setNavigatingToBotId] = useState<number | null>(
    null
  );

  // State for Wordle statistics fetched from backend
  const [wordleStats, setWordleStats] = useState<UserWordleStats | null>(null);
  const [isLoadingWordleStats, setIsLoadingWordleStats] = useState(true);
  const [wordleStatsError, setWordleStatsError] = useState<string | null>(null);

  // Removed temporary placeholder Wordle stats
  // const wordleTotalWins = 0;
  // const wordleTotalPlays = 0;
  // const wordleCurrentStreak = 0;
  // const wordleLongestStreak = 0;
  // const wordleGuessDistribution: Record<number, number> = {};
  // const wordleTotalGuessesInWonGames = 0;

  // Get the default tab from URL parameters
  const [defaultTab, setDefaultTab] = useState("history");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(gameHistory.length / PAGE_SIZE);
  const paginatedGameHistory = gameHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  // Reset to page 1 if history changes and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [gameHistory, totalPages, currentPage]);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        ["history", "stats", "bots", "wordle-stats"].includes(tabParam)
      ) {
        setDefaultTab(tabParam);
      }

      // Check for active game state
      const savedGameState = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      const savedSelectedBot = localStorage.getItem(SELECTED_BOT_STORAGE_KEY);
      let gameIsActive = false;

      if (savedGameState) {
        try {
          const gameState = JSON.parse(savedGameState);
          if (gameState.fen && gameState.fen !== DEFAULT_STATE.fen) {
            gameIsActive = true;
            if (savedSelectedBot) {
              try {
                const selectedBot: Bot = JSON.parse(savedSelectedBot);
                let botOriginalDifficulty: string | undefined = undefined;
                for (const diffKey in BOTS_BY_DIFFICULTY) {
                  const foundBot = BOTS_BY_DIFFICULTY[
                    diffKey as keyof typeof BOTS_BY_DIFFICULTY
                  ].find((b) => b.id === selectedBot.id);
                  if (foundBot) {
                    botOriginalDifficulty = diffKey.toLowerCase();
                    break;
                  }
                }

                if (
                  botOriginalDifficulty === gameState.difficulty?.toLowerCase()
                ) {
                  setActiveBotGameId(selectedBot.id);
                  setActiveBotGameDifficulty(
                    gameState.difficulty?.toLowerCase() || null
                  );
                } else {
                  setActiveBotGameId(null);
                  setActiveBotGameDifficulty(null);
                }
              } catch (e) {
                console.error("Error parsing selectedBot for history page:", e);
                setActiveBotGameId(null);
                setActiveBotGameDifficulty(null);
              }
            } else {
              setActiveBotGameId(null);
              setActiveBotGameDifficulty(null);
            }
          } else {
            // Game state exists but not active, clear associated selectedBot if any
            localStorage.removeItem(SELECTED_BOT_STORAGE_KEY);
          }
        } catch (e) {
          console.error("Error parsing gameState for history page:", e);
          localStorage.removeItem(SELECTED_BOT_STORAGE_KEY);
        }
      }
      setIsAnyGameActive(gameIsActive);
      if (!gameIsActive) {
        // Ensure specific bot game state is also cleared if no general game is active
        setActiveBotGameId(null);
        setActiveBotGameDifficulty(null);
        localStorage.removeItem(SELECTED_BOT_STORAGE_KEY); // Belt and braces
      }

      // Fetch Wordle stats from backend
      const fetchWordleStats = async () => {
        if (session?.user?.id) {
          setIsLoadingWordleStats(true);
          setWordleStatsError(null);
          const result = await getUserWordleStatsAction();
          if (result.error) {
            setWordleStatsError(result.error);
            setWordleStats(null);
          } else if (result.stats) {
            setWordleStats(result.stats);
          } else {
            // Should not happen if action is implemented correctly
            setWordleStatsError("Failed to retrieve Wordle stats.");
          }
          setIsLoadingWordleStats(false);
        } else {
          // No user session, so no stats to fetch for Wordle
          // Display a relevant message or leave stats as null/empty
          setIsLoadingWordleStats(false);
          // setWordleStatsError("Sign in to view your Wordle statistics."); // Optional: prompt to sign in
        }
      };

      fetchWordleStats();
    }
  }, [session]); // Depend on session to refetch if login status changes

  // Calculate average guesses - now derived from wordleStats
  const averageGuessesDisplay = wordleStats?.averageGuessesInWonGames
    ? wordleStats.averageGuessesInWonGames.toFixed(2)
    : "N/A";

  // Calculate Wordle Win Percentage - now derived from wordleStats
  const wordleWinPercentageDisplay =
    wordleStats && wordleStats.totalPlays > 0
      ? `${wordleStats.winPercentage.toFixed(1)}%`
      : "0.0%";

  // Check if user should be redirected based on initial state
  useEffect(() => {
    if (initialError?.includes("sign in")) {
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    }
  }, [initialError, router]);

  const getResultIcon = (result: string) => {
    switch (result) {
      case "win":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "loss":
        return <X className="h-4 w-4 text-red-500" />;
      case "draw":
        return <Minus className="h-4 w-4 text-blue-500" />;
      case "resign":
        return <Flag className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAllBots = () => {
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
  };

  const allBots = getAllBots();

  const isBotBeaten = (botName: string) => {
    if (!gameStats) return false;
    return gameStats.beatenBots.some((bot) => bot.name === botName);
  };

  const handleBotCardClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    clickedBotId: number,
    clickedBotDifficulty: string
  ) => {
    const lowerClickedBotDifficulty = clickedBotDifficulty.toLowerCase();
    if (isAnyGameActive) {
      if (
        activeBotGameId === clickedBotId &&
        activeBotGameDifficulty === lowerClickedBotDifficulty
      ) {
        router.push(href);
      } else {
        e.preventDefault();
        setPendingNavigationTarget({ href, botId: clickedBotId });
        setShowStartNewGameDialog(true);
      }
    } else {
      setNavigatingToBotId(clickedBotId);
      router.push(href);
    }
  };

  const handleConfirmStartNewGame = () => {
    if (pendingNavigationTarget) {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      localStorage.removeItem(SELECTED_BOT_STORAGE_KEY);
      setIsAnyGameActive(false);
      setActiveBotGameId(null);
      setActiveBotGameDifficulty(null);
      setNavigatingToBotId(pendingNavigationTarget.botId);
      router.push(pendingNavigationTarget.href);
    }
    setShowStartNewGameDialog(false);
    setPendingNavigationTarget(null);
  };

  const handleClearHistory = async () => {
    if (!session?.user?.id) {
      setError("You need to be signed in to clear your history");
      return;
    }

    setIsClearing(true);
    setError(null);
    setInfoMessage("");
    setSuccessMessage("");

    try {
      const success = await clearUserGameHistoryAction(session.user.id);
      if (success) {
        setGameHistory([]);
        setGameStats(null);
        setSuccessMessage("Game history cleared successfully");

        // Clear localStorage items now that server action was successful
        if (typeof window !== "undefined") {
          localStorage.removeItem("last-saved-game-id");
          localStorage.removeItem("last-saved-game-fen");
          localStorage.removeItem("chess-game-history");
          localStorage.removeItem("chess-game-stats");
          localStorage.removeItem("chess-last-game-result");
        }
      } else {
        setError("Failed to clear history. Please try again.");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("auth") ||
          error.message.includes("permission"))
      ) {
        setError("Authentication error. Please sign in again.");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(
          "An unexpected error occurred clearing history. Please try again."
        );
      }
    } finally {
      setIsClearing(false);
    }
  };

  const renderClearHistoryButton = () => {
    // Render button only if logged in and there is history
    if (!session || gameHistory.length === 0) return null;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  disabled={isClearing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Clear all game history and statistics
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Game History</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will permanently delete <strong>ALL</strong> of your:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Game History</strong> - All past games
                </li>
                <li>
                  <strong>Game Statistics</strong> - Win/loss records and
                  averages
                </li>
                <li>
                  <strong>Bot Challenge Records</strong> - All bots you&apos;ve
                  defeated
                </li>
              </ul>
              <p className="text-destructive font-semibold mt-2">
                This action cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Clear All History"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  // If there was an initial server-side error (like not logged in), show it.
  if (initialError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{initialError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8 min-h-screen">
      <Tabs defaultValue={defaultTab} value={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger
            value="history"
            className="flex items-center gap-2"
            onClick={() => setDefaultTab("history")}
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Game History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="flex items-center gap-2"
            onClick={() => setDefaultTab("stats")}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Game Statistics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="bots"
            className="flex items-center gap-2"
            onClick={() => setDefaultTab("bots")}
          >
            <BotIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Bot Challenges</span>
            <span className="sm:hidden">Challenge</span>
          </TabsTrigger>
          <TabsTrigger
            value="wordle-stats"
            className="flex items-center gap-2"
            onClick={() => setDefaultTab("wordle-stats")}
          >
            <ToyBrick className="h-4 w-4" />
            <span className="hidden sm:inline">Wordle Statistics</span>
            <span className="sm:hidden">Wordle</span>
          </TabsTrigger>
        </TabsList>

        {/* Client-side error display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message Display - Now uses successMessage */}
        {successMessage && (
          <Alert
            variant="default"
            className="mb-6 bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Game History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <History className="h-6 w-6" /> Game History
              </CardTitle>
              <CardDescription>
                View your past games and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gameHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4">
                    {infoMessage || "No games found in your history."}
                  </p>
                  <p className="text-muted-foreground">
                    Play some games to see your history here!
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Moves</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>ELO Δ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedGameHistory.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell>
                              {format(new Date(game.createdAt), "MMM d, yyyy")}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(game.createdAt), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {/* Bot Avatar */}
                                {(() => {
                                  const difficulty =
                                    game.difficulty.toLowerCase();
                                  const bot = BOTS_BY_DIFFICULTY[
                                    difficulty as keyof typeof BOTS_BY_DIFFICULTY
                                  ]?.find((b) => b.name === game.opponent);
                                  return (
                                    <Avatar className="h-8 w-8">
                                      {bot?.image ? (
                                        <AvatarImage
                                          src={bot.image}
                                          alt=""
                                          aria-hidden="true"
                                        />
                                      ) : null}
                                      <AvatarFallback>
                                        {game.opponent.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  );
                                })()}
                                <span>{game.opponent}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  game.difficulty === "beginner" &&
                                    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-500/40",
                                  game.difficulty === "easy" &&
                                    "bg-green-500/20 text-green-700 dark:text-green-200 border-green-500/40",
                                  game.difficulty === "intermediate" &&
                                    "bg-cyan-500/20 text-cyan-700 dark:text-cyan-200 border-cyan-500/40",
                                  game.difficulty === "advanced" &&
                                    "bg-blue-500/20 text-blue-700 dark:text-blue-200 border-blue-500/40",
                                  game.difficulty === "hard" &&
                                    "bg-violet-500/20 text-violet-700 dark:text-violet-200 border-violet-500/40",
                                  game.difficulty === "expert" &&
                                    "bg-purple-500/20 text-purple-700 dark:text-purple-200 border-purple-500/40",
                                  game.difficulty === "master" &&
                                    "bg-orange-500/20 text-orange-700 dark:text-orange-200 border-orange-500/40",
                                  game.difficulty === "grandmaster" &&
                                    "bg-red-500/20 text-red-700 dark:text-red-200 border-red-500/40"
                                )}
                              >
                                {game.difficulty.charAt(0).toUpperCase() +
                                  game.difficulty.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>{getResultIcon(game.result)}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {game.result === "win"
                                        ? "Win"
                                        : game.result === "loss"
                                          ? "Loss"
                                          : game.result === "draw"
                                            ? "Draw"
                                            : game.result === "resign"
                                              ? "Resigned"
                                              : "Result"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                            <TableCell>{game.movesCount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatTime(game.timeTaken)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {typeof game.eloDelta === "number" ? (
                                <span
                                  className={
                                    game.eloDelta > 0
                                      ? "text-green-500 font-semibold"
                                      : game.eloDelta < 0
                                        ? "text-red-500 font-semibold"
                                        : "text-muted-foreground"
                                  }
                                  title={
                                    typeof game.newElo === "number"
                                      ? `New ELO: ${game.newElo}`
                                      : undefined
                                  }
                                >
                                  {game.eloDelta > 0
                                    ? `+${game.eloDelta}`
                                    : game.eloDelta}
                                  {typeof game.newElo === "number" && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      ({game.newElo})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6" /> Game Statistics
              </CardTitle>
              <CardDescription>
                View your performance metrics and game analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {gameStats && gameStats.totalGames > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        Total Games Played
                      </div>
                      <div className="text-3xl font-bold">
                        {gameStats.totalGames}
                      </div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Win Rate
                      </div>
                      <div className="text-3xl font-bold">
                        {gameStats.winRate.toFixed(1)}%
                      </div>
                      <Progress
                        value={gameStats.winRate}
                        className="h-1.5 mt-2"
                        indicatorClassName={cn(
                          gameStats.winRate >= 60
                            ? "bg-green-500"
                            : gameStats.winRate >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        )}
                      />
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Footprints className="h-4 w-4 text-cyan-500" />
                        Average Moves
                      </div>
                      <div className="text-3xl font-bold">
                        {gameStats.averageMovesPerGame.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Timer className="h-4 w-4 text-orange-500" />
                        Average Time
                      </div>
                      <div className="text-3xl font-bold">
                        {formatTime(Math.round(gameStats.averageGameTime))}
                      </div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <BotIcon className="h-4 w-4 text-purple-500" />
                        Bots Defeated
                      </div>
                      <div className="text-3xl font-bold">
                        {gameStats.beatenBots.length} / {allBots.length}
                      </div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Hourglass className="h-4 w-4 text-sky-500" />
                        Total Play Time
                      </div>
                      <div className="text-3xl font-bold">
                        {((): string => {
                          const totalSeconds = Math.round(
                            gameStats.averageGameTime * gameStats.totalGames
                          );
                          const hours = Math.floor(totalSeconds / 3600);
                          const minutes = Math.floor(
                            (totalSeconds % 3600) / 60
                          );
                          if (hours > 0) {
                            return `${hours}h ${minutes}m`;
                          }
                          return `${minutes}m`;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Wins/Losses/Draws/Resigns Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-4 border-t border-border/20">
                    <div>
                      <div className="text-2xl font-semibold text-yellow-500">
                        {gameStats.wins}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Wins
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-red-500">
                        {gameStats.losses}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Losses
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-blue-500">
                        {gameStats.draws}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Draws
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-orange-500">
                        {gameStats.resigns}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Resigns
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Section */}
                  <div className="pt-4 border-t border-border/20">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-primary" /> Recent
                      Activity
                    </h3>
                    <div className="space-y-4">
                      {gameHistory.slice(0, 5).map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>{getResultIcon(game.result)}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {game.result === "win"
                                    ? "Win"
                                    : game.result === "loss"
                                      ? "Loss"
                                      : game.result === "draw"
                                        ? "Draw"
                                        : game.result === "resign"
                                          ? "Resigned"
                                          : "Result"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div>
                              <div className="font-medium">{game.opponent}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(
                                  new Date(game.createdAt),
                                  "MMM d, yyyy • h:mm a"
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium text-xs px-1.5 py-0.5", // Smaller badge
                              game.difficulty === "beginner" &&
                                "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-500/40",
                              game.difficulty === "easy" &&
                                "bg-green-500/20 text-green-700 dark:text-green-200 border-green-500/40",
                              game.difficulty === "intermediate" &&
                                "bg-cyan-500/20 text-cyan-700 dark:text-cyan-200 border-cyan-500/40",
                              game.difficulty === "advanced" &&
                                "bg-blue-500/20 text-blue-700 dark:text-blue-200 border-blue-500/40",
                              game.difficulty === "hard" &&
                                "bg-violet-500/20 text-violet-700 dark:text-violet-200 border-violet-500/40",
                              game.difficulty === "expert" &&
                                "bg-purple-500/20 text-purple-700 dark:text-purple-200 border-purple-500/40",
                              game.difficulty === "master" &&
                                "bg-orange-500/20 text-orange-700 dark:text-orange-200 border-orange-500/40",
                              game.difficulty === "grandmaster" &&
                                "bg-red-500/20 text-red-700 dark:text-red-200 border-red-500/40"
                            )}
                          >
                            {game.difficulty.charAt(0).toUpperCase() +
                              game.difficulty.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {gameHistory.length > 5 && (
                      <Button
                        variant="link"
                        className="mt-4 w-full text-primary hover:text-primary/80"
                        onClick={() => setDefaultTab("history")}
                      >
                        View All History
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    No statistics available yet.
                  </p>
                  <p className="text-muted-foreground">
                    Play some games to see your statistics here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bot Challenges Tab */}
        <TabsContent value="bots">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BotIcon className="h-6 w-6" /> Bot Challenges
              </CardTitle>
              <CardDescription>
                Track which bots you&apos;ve defeated and which ones you still
                need to conquer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gameStats && gameStats.totalGames > 0 ? (
                <div className="space-y-8">
                  {Object.keys(BOTS_BY_DIFFICULTY).map((difficulty) => (
                    <div key={difficulty} className="space-y-4">
                      <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            difficulty === "beginner" &&
                              "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-500/40",
                            difficulty === "easy" &&
                              "bg-green-500/20 text-green-700 dark:text-green-200 border-green-500/40",
                            difficulty === "intermediate" &&
                              "bg-cyan-500/20 text-cyan-700 dark:text-cyan-200 border-cyan-500/40",
                            difficulty === "advanced" &&
                              "bg-blue-500/20 text-blue-700 dark:text-blue-200 border-blue-500/40",
                            difficulty === "hard" &&
                              "bg-violet-500/20 text-violet-700 dark:text-violet-200 border-violet-500/40",
                            difficulty === "expert" &&
                              "bg-purple-500/20 text-purple-700 dark:text-purple-200 border-purple-500/40",
                            difficulty === "master" &&
                              "bg-orange-500/20 text-orange-700 dark:text-orange-200 border-orange-500/40",
                            difficulty === "grandmaster" &&
                              "bg-red-500/20 text-red-700 dark:text-red-200 border-red-500/40"
                          )}
                        >
                          {difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)}
                        </Badge>
                        <span>Bots</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {BOTS_BY_DIFFICULTY[
                          difficulty as keyof typeof BOTS_BY_DIFFICULTY
                        ].map((bot) => {
                          const botDifficultyStr = difficulty.toLowerCase();
                          const isCurrentActiveBot =
                            isAnyGameActive &&
                            activeBotGameId === bot.id &&
                            activeBotGameDifficulty === botDifficultyStr;
                          const isClickable =
                            !navigatingToBotId && !isCurrentActiveBot;
                          return (
                            <div
                              key={bot.name}
                              className="relative group focus-within:z-10"
                            >
                              <Link
                                href={`/play/${difficulty}/${bot.id}`}
                                onClick={(e) =>
                                  handleBotCardClick(
                                    e,
                                    `/play/${difficulty}/${bot.id}`,
                                    bot.id,
                                    difficulty
                                  )
                                }
                                className={cn(
                                  "block focus:outline-none",
                                  isBotBeaten(bot.name)
                                    ? "cursor-pointer"
                                    : "cursor-pointer"
                                )}
                                tabIndex={0}
                                aria-label={`Start game vs ${bot.name} (${difficulty})`}
                                onKeyDown={(
                                  e: React.KeyboardEvent<HTMLAnchorElement>
                                ) => {
                                  if (
                                    (e.key === "Enter" || e.key === " ") &&
                                    isClickable
                                  ) {
                                    e.preventDefault();
                                    router.push(
                                      `/play/${difficulty}/${bot.id}`
                                    );
                                  }
                                }}
                              >
                                <Card
                                  className={cn(
                                    "border transition-all hover:shadow relative overflow-hidden group-focus:shadow",
                                    isBotBeaten(bot.name) &&
                                      "border-accent bg-accent/40 dark:bg-accent/30",
                                    isCurrentActiveBot &&
                                      "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-background"
                                  )}
                                >
                                  {/* Hover Overlay */}
                                  {isClickable && (
                                    <div
                                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none"
                                      aria-hidden="true"
                                    >
                                      <Play className="h-6 w-6 text-white mb-2" />
                                      <span className="text-white font-semibold text-base drop-shadow">
                                        Challenge Bot
                                      </span>
                                    </div>
                                  )}
                                  <CardContent className="p-4 relative z-0">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-12 w-12">
                                        {bot?.image ? (
                                          <AvatarImage
                                            src={bot.image}
                                            alt=""
                                            aria-hidden="true"
                                          />
                                        ) : null}
                                        <AvatarFallback>
                                          {bot.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="font-semibold">
                                          {bot.name}
                                          <EloBadge
                                            elo={bot.rating}
                                            className="ml-2 align-middle"
                                          />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {bot.description}
                                        </div>
                                      </div>
                                      {navigatingToBotId === bot.id ? (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Loader2 className="h-6 w-6 animate-spin text-primary flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              Loading...
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ) : isBotBeaten(bot.name) ? (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              Bot defeated
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ) : !isCurrentActiveBot ? (
                                        <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/50 flex-shrink-0" />
                                      ) : (
                                        <div className="w-6 h-6 flex-shrink-0" />
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                              {isCurrentActiveBot && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="secondary"
                                        className="absolute top-2 right-2 bg-green-500 text-white animate-pulse"
                                      >
                                        In Progress
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Game in progress
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                      <Medal className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">
                        {gameStats.beatenBots.length} of {allBots.length} bots
                        defeated
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">No bot challenges completed yet.</p>
                  <p className="text-muted-foreground">
                    Defeat bots to track your conquests here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wordle Stats Tab */}
        <TabsContent value="wordle-stats">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ToyBrick className="h-6 w-6 text-amber-500" /> Chess Wordle
                Statistics
              </CardTitle>
              <CardDescription>
                Track your performance in the Chess Wordle puzzles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingWordleStats ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Loading Wordle Statistics...
                  </p>
                </div>
              ) : wordleStatsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Loading Wordle Stats</AlertTitle>
                  <AlertDescription>{wordleStatsError}</AlertDescription>
                </Alert>
              ) : wordleStats && wordleStats.totalPlays > 0 ? (
                <>
                  {/* Wordle Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCardItem
                      icon={Gamepad2}
                      label="Total Games Played"
                      value={wordleStats.totalPlays}
                      color="text-primary"
                    />
                    <StatCardItem
                      icon={Trophy}
                      label="Words Guessed Correctly"
                      value={wordleStats.totalWins}
                      color="text-yellow-500"
                    />
                    <StatCardItem
                      icon={Activity}
                      label="Average Guesses (Wins)"
                      value={averageGuessesDisplay}
                      color="text-cyan-500"
                    />
                    <StatCardItem
                      icon={PieChart}
                      label="Win Percentage"
                      value={wordleWinPercentageDisplay}
                      color="text-orange-500"
                    />
                    <StatCardItem
                      icon={TrendingUp}
                      label="Current Winning Streak"
                      value={wordleStats.currentStreak}
                      color="text-violet-500"
                    />
                    <StatCardItem
                      icon={Award}
                      label="Longest Winning Streak"
                      value={wordleStats.longestStreak}
                      color="text-sky-500"
                    />
                  </div>

                  {/* Guess Distribution */}
                  <div className="pt-4 border-t border-border/20">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <ChartColumnStacked className="h-5 w-5 text-primary" />{" "}
                      Guess Distribution
                    </h3>
                    {Object.keys(wordleStats.guessDistribution).length > 0 &&
                    Object.values(wordleStats.guessDistribution).some(
                      (v) => v > 0
                    ) ? (
                      <ul className="space-y-2">
                        {Object.entries(wordleStats.guessDistribution)
                          .sort(
                            ([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB)
                          )
                          .map(([guesses, count]) => {
                            if (count > 0) {
                              // Only display if count > 0
                              return (
                                <li
                                  key={guesses}
                                  className="flex justify-between items-center p-2 bg-background rounded-lg border border-border/50 text-sm"
                                >
                                  <span>
                                    Won in {guesses} guess
                                    {parseInt(guesses) > 1 ? "es" : ""}:
                                  </span>
                                  <span className="font-semibold text-primary">
                                    {count} time{count > 1 ? "s" : ""}
                                  </span>
                                </li>
                              );
                            }
                            return null;
                          })}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No guess distribution data available. Play some games!
                      </p>
                    )}
                  </div>

                  {/* Play Again Button Area */}
                  <div className="pt-6 border-t border-border/20 text-center">
                    <Link href="/play/chess-wordle" passHref legacyBehavior>
                      <Button className="bg-amber-600/30 hover:bg-amber-600/40 text-amber-400 border-amber-500/60">
                        <Play className="mr-2 h-5 w-5" /> Play Chess Wordle
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    No Chess Wordle statistics available yet.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Play some Chess Wordle puzzles to see your stats here!
                  </p>
                  <Link href="/play/chess-wordle" passHref legacyBehavior>
                    <Button className="bg-amber-600/30 hover:bg-amber-600/40 text-amber-400 border-amber-500/60 ">
                      <Play className="mr-2 h-4 w-4" /> Start Playing Chess
                      Wordle
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderClearHistoryButton()}

      <AlertDialog
        open={showStartNewGameDialog}
        onOpenChange={setShowStartNewGameDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Game?</AlertDialogTitle>
            <AlertDialogDescription>
              You have a game in progress. Starting a new game against this bot
              will erase your current game progress. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowStartNewGameDialog(false);
                setPendingNavigationTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStartNewGame}>
              Start New Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Helper component for individual stat cards for better reusability and cleaner look
const StatCardItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}> = ({ icon: Icon, label, value, color = "text-primary" }) => (
  <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
      <Icon className={cn("h-4 w-4", color)} />
      {label}
    </div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);
