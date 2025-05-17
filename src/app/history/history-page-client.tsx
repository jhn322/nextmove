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
  Swords,
  Medal,
  Brain,
  Trash2,
  Flag,
  Loader2,
  Activity,
  ToyBrick,
  TrendingUp,
  Award,
  PieChart,
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
import { type GameHistory } from "@/lib/game-service";
import { clearUserGameHistoryAction } from "@/lib/actions/game.actions";
import { Session } from "next-auth";
import Link from "next/link";
import { DEFAULT_STATE } from "@/config/game";
import { type GameStats } from "@/types/stats";

interface HistoryPageClientProps {
  session: Session | null;
  initialGameHistory: GameHistory[];
  initialGameStats: GameStats | null;
  initialError?: string;
  serverMessage?: string;
}

// Constant for game state in localStorage
const GAME_STATE_STORAGE_KEY = "chess-game-state";
const SELECTED_BOT_STORAGE_KEY = "selectedBot";
const WORDLE_WINS_STORAGE_KEY = "chessWordleWinsCount";
const WORDLE_TOTAL_PLAYS_KEY = "chessWordleTotalPlays";
const WORDLE_CURRENT_STREAK_KEY = "chessWordleCurrentStreak";
const WORDLE_LONGEST_STREAK_KEY = "chessWordleLongestStreak";
const WORDLE_GUESS_DISTRIBUTION_KEY = "chessWordleGuessDistribution";
const WORDLE_TOTAL_GUESSES_IN_WON_GAMES_KEY =
  "chessWordleTotalGuessesInWonGames";

export const HistoryPageClient = ({
  session,
  initialGameHistory,
  initialGameStats,
  initialError,
  serverMessage,
}: HistoryPageClientProps) => {
  const [gameHistory, setGameHistory] =
    useState<GameHistory[]>(initialGameHistory);
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

  const [wordleTotalWins, setWordleTotalWins] = useState<number>(0);
  const [wordleTotalPlays, setWordleTotalPlays] = useState<number>(0);
  const [wordleCurrentStreak, setWordleCurrentStreak] = useState<number>(0);
  const [wordleLongestStreak, setWordleLongestStreak] = useState<number>(0);
  const [wordleGuessDistribution, setWordleGuessDistribution] = useState<
    Record<number, number>
  >({});
  const [wordleTotalGuessesInWonGames, setWordleTotalGuessesInWonGames] =
    useState<number>(0);

  // Get the default tab from URL parameters
  const [defaultTab, setDefaultTab] = useState("history");

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

      // Load Wordle wins
      const storedWordleWins = localStorage.getItem(WORDLE_WINS_STORAGE_KEY);
      if (storedWordleWins) {
        setWordleTotalWins(parseInt(storedWordleWins, 10));
      }
      // Load detailed Wordle stats
      const storedWordleTotalPlays = localStorage.getItem(
        WORDLE_TOTAL_PLAYS_KEY
      );
      if (storedWordleTotalPlays)
        setWordleTotalPlays(parseInt(storedWordleTotalPlays, 10));

      const storedWordleCurrentStreak = localStorage.getItem(
        WORDLE_CURRENT_STREAK_KEY
      );
      if (storedWordleCurrentStreak)
        setWordleCurrentStreak(parseInt(storedWordleCurrentStreak, 10));

      const storedWordleLongestStreak = localStorage.getItem(
        WORDLE_LONGEST_STREAK_KEY
      );
      if (storedWordleLongestStreak)
        setWordleLongestStreak(parseInt(storedWordleLongestStreak, 10));

      const storedWordleGuessDistribution = localStorage.getItem(
        WORDLE_GUESS_DISTRIBUTION_KEY
      );
      if (storedWordleGuessDistribution)
        setWordleGuessDistribution(JSON.parse(storedWordleGuessDistribution));
      else setWordleGuessDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });

      const storedWordleTotalGuessesInWonGames = localStorage.getItem(
        WORDLE_TOTAL_GUESSES_IN_WON_GAMES_KEY
      );
      if (storedWordleTotalGuessesInWonGames)
        setWordleTotalGuessesInWonGames(
          parseInt(storedWordleTotalGuessesInWonGames, 10)
        );
    }
  }, []);

  // Calculate average guesses
  const averageGuesses =
    wordleTotalWins > 0
      ? (wordleTotalGuessesInWonGames / wordleTotalWins).toFixed(2)
      : "N/A";

  // Calculate Wordle Win Percentage
  const wordleWinPercentage =
    wordleTotalPlays > 0
      ? ((wordleTotalWins / wordleTotalPlays) * 100).toFixed(1)
      : "0.0";

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
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto"
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
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
                  <strong>Statistics</strong> - Win/loss records and averages
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
            <span className="hidden sm:inline">Statistics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="bots"
            className="flex items-center gap-2"
            onClick={() => setDefaultTab("bots")}
          >
            <Brain className="h-4 w-4" />
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gameHistory.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell>
                            {format(new Date(game.createdAt), "MMM d, yyyy")}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(game.createdAt), "h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell>{game.opponent}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                game.difficulty === "beginner" &&
                                  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                game.difficulty === "easy" &&
                                  "bg-green-500/10 text-green-500 border-green-500/20",
                                game.difficulty === "intermediate" &&
                                  "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
                                game.difficulty === "advanced" &&
                                  "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                game.difficulty === "hard" &&
                                  "bg-violet-500/10 text-violet-500 border-violet-500/20",
                                game.difficulty === "expert" &&
                                  "bg-purple-500/10 text-purple-500 border-purple-500/20",
                                game.difficulty === "master" &&
                                  "bg-orange-500/10 text-orange-500 border-orange-500/20",
                                game.difficulty === "grandmaster" &&
                                  "bg-red-500/10 text-red-500 border-red-500/20"
                              )}
                            >
                              {game.difficulty.charAt(0).toUpperCase() +
                                game.difficulty.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getResultIcon(game.result)}
                              <span
                                className={cn(
                                  "capitalize",
                                  game.result === "win" && "text-yellow-500",
                                  game.result === "loss" && "text-red-500",
                                  game.result === "draw" && "text-blue-500",
                                  game.result === "resign" && "text-orange-500"
                                )}
                              >
                                {game.result}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{game.movesCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatTime(game.timeTaken)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                        <Swords className="h-4 w-4 text-cyan-500" />
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
                        <Brain className="h-4 w-4 text-purple-500" />
                        Bots Beaten
                      </div>
                      <div className="text-3xl font-bold">
                        {gameStats.beatenBots.length} / {allBots.length}
                      </div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border/70 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Activity className="h-4 w-4 text-sky-500" />
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
                            {getResultIcon(game.result)}
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
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                              game.difficulty === "easy" &&
                                "bg-green-500/10 text-green-500 border-green-500/20",
                              game.difficulty === "intermediate" &&
                                "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
                              game.difficulty === "advanced" &&
                                "bg-blue-500/10 text-blue-500 border-blue-500/20",
                              game.difficulty === "hard" &&
                                "bg-violet-500/10 text-violet-500 border-violet-500/20",
                              game.difficulty === "expert" &&
                                "bg-purple-500/10 text-purple-500 border-purple-500/20",
                              game.difficulty === "master" &&
                                "bg-orange-500/10 text-orange-500 border-orange-500/20",
                              game.difficulty === "grandmaster" &&
                                "bg-red-500/10 text-red-500 border-red-500/20"
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
                <Brain className="h-6 w-6" /> Bot Challenges
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
                              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            difficulty === "easy" &&
                              "bg-green-500/10 text-green-500 border-green-500/20",
                            difficulty === "intermediate" &&
                              "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
                            difficulty === "advanced" &&
                              "bg-blue-500/10 text-blue-500 border-blue-500/20",
                            difficulty === "hard" &&
                              "bg-violet-500/10 text-violet-500 border-violet-500/20",
                            difficulty === "expert" &&
                              "bg-purple-500/10 text-purple-500 border-purple-500/20",
                            difficulty === "master" &&
                              "bg-orange-500/10 text-orange-500 border-orange-500/20",
                            difficulty === "grandmaster" &&
                              "bg-red-500/10 text-red-500 border-red-500/20"
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
                          return (
                            <div key={bot.name} className="relative">
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
                                  "block",
                                  isBotBeaten(bot.name)
                                    ? "cursor-pointer"
                                    : "cursor-pointer"
                                )}
                              >
                                <Card
                                  className={cn(
                                    "border transition-all hover:shadow-md",
                                    isBotBeaten(bot.name) &&
                                      "border-accent bg-accent/40 dark:bg-accent/30",
                                    isCurrentActiveBot &&
                                      "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-background"
                                  )}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={bot.image}
                                          alt={bot.name}
                                        />
                                        <AvatarFallback>
                                          {bot.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="font-semibold">
                                          {bot.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {bot.description}
                                        </div>
                                      </div>
                                      {navigatingToBotId === bot.id ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-primary flex-shrink-0" />
                                      ) : isBotBeaten(bot.name) ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
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
                                <Badge
                                  variant="secondary"
                                  className="absolute top-2 right-2 bg-green-500 text-white animate-pulse"
                                >
                                  In Progress
                                </Badge>
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
              {wordleTotalPlays > 0 ? (
                <>
                  {/* Wordle Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCardItem
                      icon={Gamepad2}
                      label="Total Games Played"
                      value={wordleTotalPlays}
                      color="text-primary"
                    />
                    <StatCardItem
                      icon={Trophy}
                      label="Words Guessed Correctly"
                      value={wordleTotalWins}
                      color="text-yellow-500"
                    />
                    <StatCardItem
                      icon={Activity}
                      label="Average Guesses (Wins)"
                      value={averageGuesses}
                      color="text-cyan-500"
                    />
                    <StatCardItem
                      icon={PieChart}
                      label="Win Percentage"
                      value={`${wordleWinPercentage}%`}
                      color="text-orange-500"
                    />
                    <StatCardItem
                      icon={TrendingUp}
                      label="Current Winning Streak"
                      value={wordleCurrentStreak}
                      color="text-violet-500"
                    />
                    <StatCardItem
                      icon={Award}
                      label="Longest Winning Streak"
                      value={wordleLongestStreak}
                      color="text-sky-500"
                    />
                  </div>

                  {/* Guess Distribution */}
                  <div className="pt-4 border-t border-border/20">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-primary" /> Guess
                      Distribution
                    </h3>
                    {Object.keys(wordleGuessDistribution).length > 0 &&
                    Object.values(wordleGuessDistribution).some(
                      (v) => v > 0
                    ) ? (
                      <ul className="space-y-2">
                        {Object.entries(wordleGuessDistribution)
                          .sort(
                            ([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB)
                          )
                          .map(([guesses, count]) => {
                            if (count > 0) {
                              // Only display if count > 0
                              return (
                                <li
                                  key={guesses}
                                  className="flex justify-between items-center p-2 bg-background rounded-md border border-border/50 text-sm"
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
                        <Gamepad2 className="mr-2 h-5 w-5" /> Play Chess Wordle
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ToyBrick className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    No Chess Wordle statistics available yet.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Play some Chess Wordle puzzles to see your stats here!
                  </p>
                  <Link href="/play/chess-wordle" passHref legacyBehavior>
                    <Button className="bg-amber-600/30 hover:bg-amber-600/40 text-amber-400 border-amber-500/60 ">
                      <Gamepad2 className="mr-2 h-4 w-4" /> Start Playing Chess
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
