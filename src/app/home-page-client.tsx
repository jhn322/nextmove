"use client";

import Link from "next/link";
import {
  Baby,
  BookOpen,
  Sword,
  Crosshair,
  Target,
  Trophy,
  Award,
  ChevronRight,
  LogIn,
  Sparkles,
  Brain,
  Zap,
  Shield,
  Swords,
  ChevronDown,
  Save,
  Medal,
  PartyPopper,
  Loader2,
  ToyBrick,
  SpellCheck,
  Hash,
  Lock,
  Move,
  Dice5,
  Omega,
  AudioLines,
  Blocks,
  Bot as BotIcon,
  Settings,
  BarChart2,
  Play,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import PlayerProfile from "@/components/PlayerProfile";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "@/components/game/data/bots";
import { Session } from "next-auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants/site";
import { type GameStats } from "@/types/stats";
import { DEFAULT_STATE } from "@/config/game";
import EloBadge from "@/components/ui/elo-badge";
import { getUserWordleStatsAction } from "@/lib/actions/wordle.actions";
import { resetUserProgressAction } from "@/lib/actions/game.actions";
import { useAuth } from "@/context/auth-context";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// ** Type Difficulty Cards ** //
interface GameCardConfig {
  name: string;
  href: string;
  description: string;
  color: string;
  textColor: string;
  icon: React.ElementType;
  gradient: string;
  hoverGradient: string;
  playStyle: string;
  styleIcon: React.ElementType;
  displayPlayTypeLabel?: string;
  eloRange?: string;
  eloValue?: number;
  isWordleCard?: boolean;
  statType?: "wordleWins";
}

// ** Chess Wordle Card ** //
const chessWordleCard: GameCardConfig = {
  name: "Chess Wordle",
  href: "/play/chess-wordle",
  description:
    "Guess the secret chess term! A Wordle-style puzzle to test your chess vocabulary. Unlike traditional Wordle, play as many times as you like and recieve hints!",
  color: "difficulty-wordle-bg difficulty-wordle-border",
  textColor: "difficulty-wordle-text",
  icon: ToyBrick,
  gradient: "difficulty-wordle-bg",
  hoverGradient: "hover:opacity-80",
  playStyle: "Word Puzzle",
  styleIcon: Hash,
  displayPlayTypeLabel: "Word Puzzle",
  isWordleCard: true,
  statType: "wordleWins",
};

// ** Difficulty Levels ** //
const difficultyLevels: GameCardConfig[] = [
  {
    name: "Beginner",
    href: "/play/beginner",
    description:
      "Learn the basics with a bot that makes predictable moves. Perfect for newcomers to chess or those looking to build up confidence in their skill.",
    color: "difficulty-beginner-bg difficulty-beginner-border",
    textColor: "difficulty-beginner-text",
    icon: Baby,
    gradient: "difficulty-beginner-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "200-300",
    eloValue: 10,
    playStyle: "Random",
    styleIcon: Dice5,
  },
  {
    name: "Easy",
    href: "/play/easy",
    description:
      "Practice basic strategies with slightly improved moves. Focuses on capturing pieces and developing simple threats to win the game.",
    color: "difficulty-easy-bg difficulty-easy-border",
    textColor: "difficulty-easy-text",
    icon: Blocks,
    gradient: "difficulty-easy-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "320-400",
    eloValue: 13,
    playStyle: "Aggressive",
    styleIcon: Zap,
  },
  {
    name: "Intermediate",
    href: "/play/intermediate",
    description:
      "Test your skills against a bot with moderate tactical chess awareness. It recognizes basic patterns and responds to threats intelligently.",
    color: "difficulty-intermediate-bg difficulty-intermediate-border",
    textColor: "difficulty-intermediate-text",
    icon: BookOpen,
    gradient: "difficulty-intermediate-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "450-600",
    eloValue: 20,
    playStyle: "Balanced",
    styleIcon: Shield,
  },
  {
    name: "Advanced",
    href: "/play/advanced",
    description:
      "Face stronger tactical play and strategic planning. Understands positional advantages and can execute multi-move combinations.",
    color: "difficulty-advanced-bg difficulty-advanced-border",
    textColor: "difficulty-advanced-text",
    icon: Crosshair,
    gradient: "difficulty-advanced-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "700-900",
    eloValue: 30,
    playStyle: "Positional",
    styleIcon: Move,
  },
  {
    name: "Hard",
    href: "/play/hard",
    description:
      "Challenge yourself with advanced strategies and combinations. Plays with purpose and can exploit weaknesses in your position.",
    color: "difficulty-hard-bg difficulty-hard-border",
    textColor: "difficulty-hard-text",
    icon: Sword,
    gradient: "difficulty-hard-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "950-1200",
    eloValue: 40,
    playStyle: "Tactical",
    styleIcon: AudioLines,
  },
  {
    name: "Expert",
    href: "/play/expert",
    description:
      "Test yourself against sophisticated positional understanding. Executes long-term plans and creates complex tactical opportunities.",
    color: "difficulty-expert-bg difficulty-expert-border",
    textColor: "difficulty-expert-text",
    icon: Swords,
    gradient: "difficulty-expert-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "1250-1700",
    eloValue: 58,
    playStyle: "Dynamic",
    styleIcon: Omega,
  },
  {
    name: "Master",
    href: "/play/master",
    description:
      "Face the second strongest bot with sophisticated chess understanding. Calculates deeply and rarely makes mistakes in its execution.",
    color: "difficulty-master-bg difficulty-master-border",
    textColor: "difficulty-master-text",
    icon: Award,
    gradient: "difficulty-master-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "1800-2400",
    eloValue: 81,
    playStyle: "Strategic",
    styleIcon: Brain,
  },
  {
    name: "Grandmaster",
    href: "/play/grandmaster",
    description:
      "Challenge the ultimate bot with masterful chess execution. Plays at near-perfect level with deep calculation and strategic brilliance.",
    color: "difficulty-grandmaster-bg difficulty-grandmaster-border",
    textColor: "difficulty-grandmaster-text",
    icon: Trophy,
    gradient: "difficulty-grandmaster-bg",
    hoverGradient: "hover:opacity-80",
    eloRange: "2500-3000",
    eloValue: 100,
    playStyle: "Universal",
    styleIcon: Target,
  },
  chessWordleCard,
];

interface HomePageClientProps {
  session: Session | null;
  gameStats: GameStats | null;
  nextBot: (Bot & { difficulty: string }) | null;
  allBotsBeaten: boolean;
}

// Constant for game state in localStorage
const GAME_STATE_STORAGE_KEY = "chess-game-state";

// ** Signed-in Features Info Card ** //
const SignedInFeaturesInfo = () => (
  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6 sticky top-6 shadow-lg animate-fadeIn">
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-primary/10 p-2 rounded-full">
        <LogIn className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">Unlock More Features</h3>
        <p className="text-xs text-muted-foreground">
          Sign in to access these:
        </p>
      </div>
    </div>
    <ul className="space-y-3 mt-2">
      <li className="flex items-start gap-3">
        <Settings
          className="h-5 w-5 text-primary shrink-0"
          aria-hidden="true"
        />
        <span>
          <span className="font-medium">Settings:</span> Customize piece set,
          board theme, and advanced game options.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <BarChart2
          className="h-5 w-5 text-primary shrink-0"
          aria-hidden="true"
        />
        <span>
          <span className="font-medium">History & Stats:</span> View
          comprehensive statistics for all your games.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <ToyBrick
          className="h-5 w-5 text-primary shrink-0"
          aria-hidden="true"
        />
        <span>
          <span className="font-medium">Chess Wordle:</span> Play the exclusive
          chess word puzzle game.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <BotIcon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium">Bot Progression:</span> Track victories
          against all 48 unique bots.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <Hash className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium">ELO Rating:</span> Compete and improve
          your ELO-based chess rating as you play.
        </span>
      </li>
    </ul>
  </div>
);

export function HomePageClient({
  session,
  gameStats,
  nextBot,
  allBotsBeaten,
}: HomePageClientProps) {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [showGameInProgressDialog, setShowGameInProgressDialog] =
    useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<{
    href: string;
    name?: string;
  } | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [activeGameDifficulty, setActiveGameDifficulty] = useState<
    string | null
  >(null);
  const [activeGameSpecificBotId, setActiveGameSpecificBotId] = useState<
    string | number | null
  >(null);
  const [activeGameSpecificBotDifficulty, setActiveGameSpecificBotDifficulty] =
    useState<string | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isBotProgressionLoading, setIsBotProgressionLoading] = useState(false);
  const [isResettingProgress, setIsResettingProgress] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

  // State for Wordle total wins fetched from backend
  const [wordleTotalWins, setWordleTotalWins] = useState<number | null>(null);
  const [isLoadingWordleTotalWins, setIsLoadingWordleTotalWins] =
    useState(false);
  const [wordleTotalWinsError, setWordleTotalWinsError] = useState<
    string | null
  >(null);

  const isUserLoggedIn = !!session;

  // Track mouse position for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Check for saved game on mount (client-side only)
  useEffect(() => {
    const checkActiveGame = () => {
      if (typeof window === "undefined") return false;

      const savedGameState = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      const savedSelectedBot = localStorage.getItem("selectedBot");

      if (savedGameState) {
        try {
          const gameState = JSON.parse(savedGameState);
          const isActive = gameState.fen && gameState.fen !== DEFAULT_STATE.fen;

          if (isActive) {
            setActiveGameDifficulty(
              gameState.difficulty?.toLowerCase() || null
            );

            if (savedSelectedBot) {
              try {
                const selectedBot: Bot & { difficulty?: string } =
                  JSON.parse(savedSelectedBot);
                // Ensure the selectedBot's context matches the active game's difficulty

                let botContextualDifficulty =
                  gameState.difficulty?.toLowerCase();

                // If selectedBot itself has a difficulty field, prefer it for more direct match
                if (selectedBot.difficulty) {
                  botContextualDifficulty =
                    selectedBot.difficulty.toLowerCase();
                }

                if (
                  botContextualDifficulty ===
                  gameState.difficulty?.toLowerCase()
                ) {
                  setActiveGameSpecificBotId(selectedBot.id);
                  setActiveGameSpecificBotDifficulty(
                    gameState.difficulty?.toLowerCase() || null
                  );
                } else {
                  // Mismatch, so no specific bot game is active despite selectedBot existing

                  setActiveGameSpecificBotId(null);
                  setActiveGameSpecificBotDifficulty(null);
                }
              } catch (e) {
                console.error("Error parsing selectedBot:", e);
                setActiveGameSpecificBotId(null);
                setActiveGameSpecificBotDifficulty(null);
              }
            } else {
              setActiveGameSpecificBotId(null);
              setActiveGameSpecificBotDifficulty(null);
            }
            return true;
          } else {
            // Game state exists but isn't truly active
            localStorage.removeItem(GAME_STATE_STORAGE_KEY);
            localStorage.removeItem("selectedBot");
          }
        } catch (e) {
          console.error("Error parsing gameState:", e);
          localStorage.removeItem(GAME_STATE_STORAGE_KEY);
          localStorage.removeItem("selectedBot");
        }
      }
      // Reset all if no active game state
      setActiveGameDifficulty(null);
      setActiveGameSpecificBotId(null);
      setActiveGameSpecificBotDifficulty(null);
      return false;
    };

    // The result of checkActiveGame directly sets isGameActive
    setIsGameActive(checkActiveGame());

    // Fetch Wordle total wins if user is logged in
    const fetchWordleWins = async () => {
      if (session?.user?.id) {
        setIsLoadingWordleTotalWins(true);
        setWordleTotalWinsError(null);
        const result = await getUserWordleStatsAction();
        if (result.error) {
          setWordleTotalWinsError(result.error);
          setWordleTotalWins(null);
        } else if (result.stats) {
          setWordleTotalWins(result.stats.totalWins);
        } else {
          setWordleTotalWinsError("Failed to retrieve Wordle wins.");
          setWordleTotalWins(null);
        }
        setIsLoadingWordleTotalWins(false);
      }
    };

    if (isUserLoggedIn) {
      fetchWordleWins();
    }
  }, [session, isUserLoggedIn]);

  const handleNavigationAttempt = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetHref: string,
    targetType: "difficulty" | "botChallenge",
    targetName?: string
  ) => {
    if (navigatingTo === targetName || navigatingTo === targetHref) {
      e.preventDefault();
      return;
    }

    if (isGameActive) {
      let shouldShowDialog = false;

      if (targetType === "difficulty") {
        if (activeGameDifficulty?.toLowerCase() !== targetName?.toLowerCase()) {
          shouldShowDialog = true;
        }
      } else if (targetType === "botChallenge") {
        // Check if navigating to the *current specific active game*. If so, no dialog.
        if (
          nextBot &&
          activeGameSpecificBotId === nextBot.id &&
          activeGameSpecificBotDifficulty === nextBot.difficulty.toLowerCase()
        ) {
          shouldShowDialog = false;
        } else {
          shouldShowDialog = true;
        }
      }

      if (shouldShowDialog) {
        e.preventDefault();
        setPendingNavigationTarget({ href: targetHref, name: targetName });
        setShowGameInProgressDialog(true);
      } else {
        if (targetName) setNavigatingTo(targetName);
        router.push(targetHref);
      }
    } else {
      if (targetName) setNavigatingTo(targetName);
      router.push(targetHref); // Proceed with navigation if no active game
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigationTarget) {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      localStorage.removeItem("selectedBot");
      setIsGameActive(false);
      setActiveGameDifficulty(null);
      setActiveGameSpecificBotId(null);
      setActiveGameSpecificBotDifficulty(null);
      if (pendingNavigationTarget.name) {
        setNavigatingTo(pendingNavigationTarget.name);
      }
      router.push(pendingNavigationTarget.href);
    }
    setShowGameInProgressDialog(false);
    setPendingNavigationTarget(null);
  };

  const toggleCardExpansion = (e: React.MouseEvent, levelName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCards((prev) => ({
      ...prev,
      [levelName]: !prev[levelName],
    }));
  };

  // Handle replay journey - keep progress
  const handleReplayJourney = () => {
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
        }

        // Refresh session to get updated user data
        await refreshSession();

        // Navigate to beginner after successful reset
        router.push("/play/beginner");
      }
    } catch (error) {
      console.error("Error resetting progress:", error);
    } finally {
      setIsResettingProgress(false);
      setShowResetConfirmDialog(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      <div className="absolute top-0 left-0 right-0 h-[500px] -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent blur-3xl opacity-30"></div>

      {/* Chess pattern background */}
      <div
        className="absolute inset-0 -z-20 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h30v30H0V0zm30 30h30v30H30V30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Chess piece decorations */}
      <div className="absolute top-20 right-[5%] opacity-5 dark:opacity-10 rotate-12 hidden lg:block">
        <Image
          src="/pieces/staunty/wn.svg"
          alt="Knight"
          width={120}
          height={120}
        />
      </div>
      <div className="absolute bottom-20 left-[5%] opacity-5 dark:opacity-10 -rotate-12 hidden lg:block">
        <Image
          src="/pieces/staunty/wq.svg"
          alt="Queen"
          width={150}
          height={150}
        />
      </div>

      <div className="max-w-7xl w-full px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4 pt-6 sm:pt-4">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-primary">{APP_NAME}</span>
            </h1>
            <div className="absolute -top-6 sm:-top-6 sm:-right-6 right-0 text-primary">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl">
            Master your chess skills against increasingly difficult opponents
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-primary/50 to-primary rounded-full mt-4"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Difficulty Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {difficultyLevels.map((level) => {
              const isChessWordleCard = level.isWordleCard;
              let currentCardHref = level.href;
              let currentCardOnClick:
                | ((e: React.MouseEvent<HTMLAnchorElement>) => void)
                | undefined = (e) =>
                handleNavigationAttempt(
                  e,
                  level.href,
                  "difficulty",
                  level.name
                );
              let showLockOverlay = false;
              let cardClasses = `relative p-5 rounded-lg border ${
                level.isWordleCard
                  ? "border-2 border-amber-500/80"
                  : "border-border/50"
              } bg-gradient-to-br ${level.gradient} ${level.hoverGradient} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group overflow-hidden animate-fadeIn flex flex-col`;

              if (isChessWordleCard && !isUserLoggedIn) {
                currentCardHref = "/auth/login?callbackUrl=/play/chess-wordle";
                currentCardOnClick = undefined;
                showLockOverlay = true;
                cardClasses = cn(cardClasses, "brightness-75 opacity-80");
              }

              return (
                <Link
                  key={level.name}
                  href={currentCardHref}
                  onClick={currentCardOnClick}
                  className={cardClasses}
                  onMouseEnter={() => {
                    if (showLockOverlay) return;
                    setHoveredCard(level.name);
                  }}
                  onMouseMove={(e) => {
                    if (showLockOverlay) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setMousePosition({ x, y });
                  }}
                  onMouseLeave={() => {
                    if (showLockOverlay) return;
                    setHoveredCard(null);
                  }}
                  style={{
                    animationDelay: `${difficultyLevels.indexOf(level) * 100}ms`,
                  }}
                  aria-disabled={showLockOverlay}
                  tabIndex={showLockOverlay ? -1 : 0}
                >
                  {/* Spotlight effect */}
                  {hoveredCard === level.name && !showLockOverlay && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                        level.hoverGradient,
                        level.isWordleCard &&
                          "ring-4 ring-amber-500/70 shadow-2xl shadow-amber-500/30"
                      )}
                      style={{
                        background: `radial-gradient(600px circle at ${
                          mousePosition.x -
                          (document
                            .getElementById(`card-${level.name}`)
                            ?.getBoundingClientRect().left || 0)
                        }px ${
                          mousePosition.y -
                          (document
                            .getElementById(`card-${level.name}`)
                            ?.getBoundingClientRect().top || 0)
                        }px, ${
                          level.isWordleCard
                            ? "rgba(0, 128, 128, 0.25)"
                            : "rgba(180, 180, 180, 0.15)"
                        }, transparent 80%)`,
                      }}
                    />
                  )}

                  {/* Overlay for Wordle Card if not logged in */}
                  {showLockOverlay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-20 p-4 text-center pointer-events-none">
                      <Lock className="w-8 h-8 text-white mb-2" />
                      <h3 className="text-base font-semibold text-white mb-1">
                        Login to Play
                      </h3>
                      <p className="text-sm text-white">
                        This feature is only available for signed-in users.
                      </p>
                    </div>
                  )}

                  {/* In Progress badge - only visible on sm and larger screens */}
                  {isGameActive &&
                    activeGameDifficulty?.toLowerCase() ===
                      level.name.toLowerCase() && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute bottom-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg z-10 animate-pulse hidden sm:block">
                              In Progress
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Game in progress</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                  {/* Card content */}
                  <div className="flex flex-col h-full z-10 relative">
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className={cn(
                          "p-2.5 rounded-lg transform transition-transform duration-300",
                          `${level.color.split(" ")[0]} bg-opacity-30 backdrop-blur-sm`,
                          !showLockOverlay && "group-hover:rotate-3"
                        )}
                      >
                        <level.icon
                          className={cn(
                            `h-6 w-6 ${level.textColor} transition-transform`,
                            !showLockOverlay && "group-hover:scale-110"
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">{level.name}</h2>
                          {/* Save icon for mobile */}
                          {isGameActive &&
                            activeGameDifficulty?.toLowerCase() ===
                              level.name.toLowerCase() && (
                              <>
                                <div
                                  className="relative hidden [@media(max-width:400px)]:block"
                                  title="Game In Progress"
                                >
                                  <div className="inline-flex items-center rounded-full border border-transparent bg-green-500 px-2 py-0.5">
                                    <Save className="h-4 w-4 text-white animate-pulse" />
                                  </div>
                                </div>
                                <div
                                  className="relative [@media(max-width:400px)]:hidden sm:hidden"
                                  title="Game In Progress"
                                >
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-500 text-white animate-pulse"
                                  >
                                    In Progress
                                  </Badge>
                                </div>
                              </>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <level.styleIcon
                            className={`h-3.5 w-3.5 ${level.textColor}`}
                          />
                          <span
                            className={`text-xs font-medium ${level.textColor}`}
                          >
                            {level.displayPlayTypeLabel ||
                              `${level.playStyle} Style`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleCardExpansion(e, level.name)}
                        className={`sm:hidden p-1.5 rounded-full ${
                          level.color.split(" ")[0]
                        } ${level.textColor} transition-transform duration-300 ${
                          expandedCards[level.name] ? "rotate-180" : "rotate-0"
                        }`}
                        aria-label={
                          expandedCards[level.name]
                            ? `Collapse details for ${level.name}`
                            : `Expand details for ${level.name}`
                        }
                        title={
                          expandedCards[level.name]
                            ? `Collapse details for ${level.name}`
                            : `Expand details for ${level.name}`
                        }
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Mobile collapsible content */}
                    <div
                      className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedCards[level.name]
                          ? "max-h-96 opacity-100 mb-4"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-muted-foreground text-sm">
                        {level.description}
                      </p>

                      {/* ELO Rating Bar */}
                      <div className="mt-4 space-y-1.5">
                        {level.statType === "wordleWins" ? (
                          <>
                            {isUserLoggedIn ? (
                              <div className="flex items-center">
                                <SpellCheck className="w-4 h-4 mr-1.5 text-amber-400" />
                                <span className="text-xs font-medium text-amber-300">
                                  {isLoadingWordleTotalWins
                                    ? "Loading..."
                                    : wordleTotalWinsError
                                      ? "Error"
                                      : `Words Guessed: ${wordleTotalWins ?? "N/A"}`}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center opacity-50">
                                <SpellCheck className="w-4 h-4 mr-1.5 text-amber-400/70" />
                                <span className="text-xs font-medium text-amber-300/70">
                                  {isLoadingWordleTotalWins
                                    ? "Loading wins..."
                                    : wordleTotalWinsError
                                      ? "Error loading wins"
                                      : `Words Guessed: ${wordleTotalWins ?? "N/A"}`}
                                </span>
                              </div>
                            )}
                          </>
                        ) : level.eloRange ? (
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-300">
                              Elo: {level.eloRange}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Play button for expanded mobile view */}
                      <div className="flex justify-end mt-4">
                        {navigatingTo === level.name ? (
                          <div
                            className={`${level.textColor} flex items-center gap-1 text-sm font-medium`}
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <div
                            className={`${level.textColor} flex items-center gap-1 text-sm font-medium`}
                          >
                            Play now{" "}
                            <ChevronRight className="h-4 w-4 animate-bounceX" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop always visible content */}
                    <div className="hidden sm:block">
                      <p className="text-muted-foreground text-sm min-h-[4.5rem]">
                        {level.description}
                      </p>

                      {/* ELO Rating Bar or Chess Wordle Statistics for Desktop */}
                      <div className="mt-4 space-y-1.5">
                        {level.statType === "wordleWins" ? (
                          <>
                            {isUserLoggedIn ? (
                              <div className="flex items-center">
                                <SpellCheck className="w-4 h-4 mr-1.5 text-amber-400" />
                                <span className="text-sm font-medium text-amber-300">
                                  {isLoadingWordleTotalWins
                                    ? "Loading..."
                                    : wordleTotalWinsError
                                      ? "Error"
                                      : `Words Guessed: ${wordleTotalWins ?? "N/A"}`}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center opacity-50">
                                <SpellCheck className="w-4 h-4 mr-1.5 text-amber-400/70" />
                                <span className="text-sm font-medium text-amber-300/70">
                                  {isLoadingWordleTotalWins
                                    ? "Loading wins..."
                                    : wordleTotalWinsError
                                      ? "Error loading wins"
                                      : `Words Guessed: ${wordleTotalWins ?? "N/A"}`}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium">ELO Rating</span>
                              <span
                                className={`${level.textColor} font-medium`}
                              >
                                {level.eloRange}
                              </span>
                            </div>
                            <Progress
                              value={level.eloValue}
                              className="h-1.5"
                              indicatorClassName={level.color.split(" ")[0]}
                              aria-label={`ELO Rating Progress for ${level.name}`}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mobile ELO summary when collapsed */}
                    <div
                      className={`sm:hidden ${
                        expandedCards[level.name] ? "hidden" : "block"
                      } mt-2 mb-1`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        {level.statType === "wordleWins" ? (
                          <span className="font-medium text-amber-300">
                            {isUserLoggedIn ? (
                              <>
                                {isLoadingWordleTotalWins ? (
                                  <Loader2 className="h-3 w-3 animate-spin inline-block mr-1" />
                                ) : wordleTotalWinsError ? (
                                  "Error"
                                ) : (
                                  <>
                                    Words:{" "}
                                    <span className={level.textColor}>
                                      {wordleTotalWins ?? "N/A"}
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="opacity-50">Words: N/A</span>
                            )}
                          </span>
                        ) : (
                          <span className="font-medium">
                            ELO:{" "}
                            <span className={`${level.textColor}`}>
                              {level.eloRange}
                            </span>
                          </span>
                        )}
                        {navigatingTo === level.name ? (
                          <Loader2
                            className={`h-3 w-3 animate-spin ${level.textColor}`}
                          />
                        ) : (
                          <div
                            className={`sm:hidden ${level.textColor} flex items-center gap-1 text-xs font-medium`}
                          >
                            Play{" "}
                            <ChevronRight className="h-3 w-3 animate-bounceX" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "mt-auto pt-3 self-end",
                        level.textColor,
                        "sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hidden sm:flex items-center gap-1 text-sm font-medium",
                        showLockOverlay && "!opacity-0 !hidden"
                      )}
                    >
                      {navigatingTo === level.name ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Play now{" "}
                          <ChevronRight className="h-4 w-4 animate-bounceX" />
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Content */}
          <div className="lg:row-span-1 space-y-6">
            {/* Show signed-in features info for visitors */}
            {!session && <SignedInFeaturesInfo />}

            {/* Player Profile Card */}
            <PlayerProfile
              className="mb-6"
              totalGames={gameStats?.totalGames}
              winRate={gameStats?.winRate}
              wins={gameStats?.wins}
              losses={gameStats?.losses}
              draws={gameStats?.draws}
              resigns={gameStats?.resigns}
            />

            {/* Challenge Description */}
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6 sticky top-6 shadow-lg animate-fadeIn">
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 inline-block">
                  The Ultimate Chess Challenge
                </h2>
                <div className="h-1 w-12 bg-primary/50 rounded-full mb-5"></div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Can you conquer all eight bot categories? Play against 48 unique
                opponents, from Beginner to Grandmaster level.
              </p>

              {/* Progress Link */}
              {session && (
                <Link
                  href="/history?tab=bots"
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors mb-6 group"
                  scroll={false}
                  onClick={() => setIsBotProgressionLoading(true)}
                >
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BotIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      Bot Progression
                      {!isBotProgressionLoading && (
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </h3>
                    {isBotProgressionLoading ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          </TooltipTrigger>
                          <TooltipContent>Loading...</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Track your victories and challenges
                      </p>
                    )}
                  </div>
                  {gameStats && (
                    <Badge variant="secondary" className="ml-2">
                      {gameStats.beatenBots.length}/48
                    </Badge>
                  )}
                </Link>
              )}

              {/* Stats Section */}
              <div className="space-y-4">
                {session ? ( // Check if user is logged in
                  allBotsBeaten ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="bg-primary/10 p-4 rounded-full inline-block">
                        <PartyPopper className="h-8 w-8 text-primary animate-bounce" />
                      </div>
                      <h3 className="font-bold text-xl">Congratulations!</h3>
                      <p className="text-muted-foreground">
                        You&apos;ve beaten all the bots! What would you like to
                        do next?
                      </p>
                      <div className="space-y-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleReplayJourney}
                                variant="default"
                                className="w-full text-base py-2 h-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg font-semibold flex items-center justify-center gap-2 rounded-lg"
                                aria-label="Replay journey keeping your current progress"
                              >
                                <Play className="h-5 w-5" />
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
                                className="w-full text-base py-2 h-auto border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 font-semibold flex items-center justify-center gap-2 rounded-lg"
                                aria-label="Reset all progress and start completely fresh"
                              >
                                <RotateCcw className="h-5 w-5" />
                                Start Fresh
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Clear all chess progress, ELO, and game history
                                to start the bot challenge fresh
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ) : nextBot ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Medal className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">Next Challenge</h3>
                          <p className="text-sm text-muted-foreground">
                            Beat this bot to progress on your journey
                          </p>
                        </div>
                        {isGameActive &&
                          activeGameSpecificBotId === nextBot.id &&
                          activeGameSpecificBotDifficulty ===
                            nextBot.difficulty.toLowerCase() && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-green-500 animate-pulse whitespace-nowrap shrink-0"
                            >
                              In Progress
                            </Badge>
                          )}
                      </div>

                      {/* Next Bot Card */}
                      <Link
                        href={`/play/${nextBot.difficulty.toLowerCase()}/${
                          nextBot.id
                        }`}
                        onClick={(e) =>
                          handleNavigationAttempt(
                            e,
                            `/play/${nextBot.difficulty.toLowerCase()}/${
                              nextBot.id
                            }`,
                            "botChallenge",
                            nextBot.name
                          )
                        }
                        className="group block p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={nextBot.image}
                              alt={nextBot.name}
                            />
                            <AvatarFallback>
                              {nextBot.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{nextBot.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {nextBot.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  nextBot.difficulty.toLowerCase() ===
                                    "beginner" &&
                                    "difficulty-beginner-bg difficulty-beginner-text difficulty-beginner-border",
                                  nextBot.difficulty.toLowerCase() === "easy" &&
                                    "difficulty-easy-bg difficulty-easy-text difficulty-easy-border",
                                  nextBot.difficulty.toLowerCase() ===
                                    "intermediate" &&
                                    "difficulty-intermediate-bg difficulty-intermediate-text difficulty-intermediate-border",
                                  nextBot.difficulty.toLowerCase() ===
                                    "advanced" &&
                                    "difficulty-advanced-bg difficulty-advanced-text difficulty-advanced-border",
                                  nextBot.difficulty.toLowerCase() === "hard" &&
                                    "difficulty-hard-bg difficulty-hard-text difficulty-hard-border",
                                  nextBot.difficulty.toLowerCase() ===
                                    "expert" &&
                                    "difficulty-expert-bg difficulty-expert-text difficulty-expert-border",
                                  nextBot.difficulty.toLowerCase() ===
                                    "master" &&
                                    "difficulty-master-bg difficulty-master-text difficulty-master-border",
                                  nextBot.difficulty.toLowerCase() ===
                                    "grandmaster" &&
                                    "difficulty-grandmaster-bg difficulty-grandmaster-text difficulty-grandmaster-border"
                                )}
                              >
                                {nextBot.difficulty.charAt(0).toUpperCase() +
                                  nextBot.difficulty.slice(1).toLowerCase()}
                              </Badge>
                              <EloBadge elo={nextBot.rating} />
                            </div>
                          </div>
                          {navigatingTo === nextBot.name ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                                </TooltipTrigger>
                                <TooltipContent>Loading...</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          )}
                        </div>
                      </Link>
                    </>
                  ) : (
                    // Logged in, but stats might still be loading or failed
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Loading bot progression...
                      </p>
                    </div>
                  )
                ) : (
                  // User is not logged in
                  <div className="border border-primary/30 rounded-lg p-4 my-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Track Your Progress</h3>
                        <p className="text-xs text-muted-foreground">
                          Challenge all 48 unique bots
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      Sign in to unlock personalized challenges, track your
                      victories, and climb the ranks from Beginner to
                      Grandmaster.
                    </p>

                    <Link
                      href="/api/auth/signin"
                      className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Begin Your Journey
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showGameInProgressDialog}
        onOpenChange={setShowGameInProgressDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Game In Progress
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have a game in progress. Starting a new game or changing
              difficulty will erase your current game. Are you sure you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowGameInProgressDialog(false);
                setPendingNavigationTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </main>
  );
}
