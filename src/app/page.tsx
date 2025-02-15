"use client";

import Link from "next/link";
import {
  Puzzle,
  Baby,
  Gamepad2,
  Swords,
  Sword,
  Crosshair,
  Target,
  Trophy,
  Award,
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
import { useState } from "react";

const difficultyLevels = [
  {
    name: "Beginner",
    href: "/play/beginner",
    description: "Learn the basics with a bot that makes predictable moves.",
    color: "bg-emerald-500/30 hover:bg-emerald-500/20 border-emerald-500/50",
    textColor: "text-emerald-500",
    icon: Baby,
  },
  {
    name: "Easy",
    href: "/play/easy",
    description: "Practice basic strategies with slightly improved moves.",
    color: "bg-green-500/30 hover:bg-green-500/20 border-green-500/50",
    textColor: "text-green-500",
    icon: Gamepad2,
  },
  {
    name: "Intermediate",
    href: "/play/intermediate",
    description:
      "Test your skills against a bot with moderate tactical awareness.",
    color: "bg-cyan-500/30 hover:bg-cyan-500/20 border-cyan-500/50",
    textColor: "text-cyan-500",
    icon: Swords,
  },
  {
    name: "Advanced",
    href: "/play/advanced",
    description: "Face stronger tactical play and strategic planning.",
    color: "bg-blue-500/30 hover:bg-blue-500/20 border-blue-500/50",
    textColor: "text-blue-500",
    icon: Sword,
  },
  {
    name: "Hard",
    href: "/play/hard",
    description:
      "Challenge yourself with advanced strategies and combinations.",
    color: "bg-violet-500/30 hover:bg-violet-500/20 border-violet-500/50",
    textColor: "text-violet-500",
    icon: Crosshair,
  },
  {
    name: "Expert",
    href: "/play/expert",
    description:
      "Test yourself against sophisticated positional understanding.",
    color: "bg-purple-500/30 hover:bg-purple-500/20 border-purple-500/50",
    textColor: "text-purple-500",
    icon: Target,
  },
  {
    name: "Master",
    href: "/play/master",
    description:
      "Face the second strongest bot with sophisticated chess understanding.",
    color: "bg-orange-500/30 hover:bg-orange-500/20 border-orange-500/50",
    textColor: "text-orange-500",
    icon: Award,
  },
  {
    name: "Grandmaster",
    href: "/play/grandmaster",
    description: "Challenge the ultimate bot with masterful chess execution.",
    color: "bg-red-500/30 hover:bg-red-500/20 border-red-500/50",
    textColor: "text-red-500",
    icon: Trophy,
  },
];

export default function Home() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<
    (typeof difficultyLevels)[0] | null
  >(null);

  // Check for saved game
  const getSavedGameDifficulty = () => {
    if (typeof window === "undefined") return null;

    const saved = localStorage.getItem("chess-game-state");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Only return difficulty if game was actually started
        return state.gameStarted ? state.difficulty : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const savedDifficulty = getSavedGameDifficulty();

  const handleDifficultyClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    level: (typeof difficultyLevels)[0]
  ) => {
    // If there's a saved game and user is clicking a different difficulty
    if (
      savedDifficulty &&
      savedDifficulty.toLowerCase() !== level.name.toLowerCase()
    ) {
      e.preventDefault();
      setPendingDifficulty(level);
      setShowDialog(true);
    }
  };

  const handleConfirm = () => {
    if (pendingDifficulty) {
      localStorage.removeItem("chess-game-state");
      router.push(pendingDifficulty.href);
    }
    setShowDialog(false);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 sm:p-8">
      <div className="max-w-7xl w-full space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Puzzle className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Welcome to Chess-Next
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Master your chess skills against increasingly challenging bot
              opponents
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Difficulty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1">
            {difficultyLevels.map((level) => (
              <Link
                key={level.name}
                href={level.href}
                onClick={(e) => handleDifficultyClick(e, level)}
                className={`relative p-4 sm:p-6 rounded-xl border ${level.color} transition-all duration-200 hover:scale-[1.02] group`}
              >
                {savedDifficulty?.toLowerCase() ===
                  level.name.toLowerCase() && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                    Saved Game
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <level.icon
                    className={`h-8 w-8 ${level.textColor} group-hover:scale-110 transition-transform`}
                  />
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {level.name}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {level.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Challenge Description */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 sticky top-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">
                The Ultimate Chess Challenge
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Can you conquer all eight levels of bot opponents? Start your
                journey as a beginner and work your way up to face the
                formidable Grandmaster bot. Each level presents unique
                challenges and learning opportunities. Do you have what it takes
                to become a true chess master?
              </p>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Start New Game?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have a saved game in progress. Starting a new game will lose
              your current progress. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
