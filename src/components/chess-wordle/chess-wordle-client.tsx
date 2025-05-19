"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { CHESS_WORDLE_WORDS } from "@/lib/chess-wordle-words";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CHESS_WORDLE } from "@/lib/constants/site";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// ** Constants ** //
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const VALID_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Threshold for showing word suggestion
const INVALID_GUESS_SUGGESTION_THRESHOLD = 5;

// ** Types and Interfaces ** //
interface Guess {
  word: string;
  statuses: LetterStatus[];
}

type LetterStatus = "correct" | "present" | "absent" | "empty";

type GameStatus = "playing" | "won" | "lost" | "idle";

interface KeyboardLetterStatus {
  [key: string]: LetterStatus | undefined;
}

export function ChessWordleClient() {
  // ** State Management ** //
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [keyboardStatuses, setKeyboardStatuses] =
    useState<KeyboardLetterStatus>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [invalidGuessStreak, setInvalidGuessStreak] = useState<number>(0);
  const [showSuggestionButton, setShowSuggestionButton] =
    useState<boolean>(false);
  const [suggestedWordHint, setSuggestedWordHint] = useState<string | null>(
    null
  );
  const { data: session } = useSession();

  // ** Valid Words ** //
  const validFiveLetterWords = useMemo(() => {
    return CHESS_WORDLE_WORDS.filter((word) => word.length === WORD_LENGTH).map(
      (word) => word.toUpperCase()
    );
  }, []);

  // ** Game Initialization and Reset ** //
  const initializeGame = useCallback(() => {
    if (validFiveLetterWords.length === 0) {
      toast.error(
        "No valid words of the required length found. Please check word list."
      );
      setGameStatus("idle");
      setTargetWord("ERROR");
      return;
    }
    const newWord =
      validFiveLetterWords[
        Math.floor(Math.random() * validFiveLetterWords.length)
      ].toUpperCase();
    setTargetWord(newWord);
    setGuesses(
      Array(MAX_GUESSES)
        .fill(null)
        .map(() => ({
          word: "".padEnd(WORD_LENGTH, " "),
          statuses: Array(WORD_LENGTH).fill("empty") as LetterStatus[],
        }))
    );
    setCurrentGuess("");
    setGameStatus("playing");
    setKeyboardStatuses({});
  }, [
    setTargetWord,
    setGuesses,
    setCurrentGuess,
    setGameStatus,
    setKeyboardStatuses,
    validFiveLetterWords,
  ]);

  // ** Game Logic Functions ** //
  const recordWordleAttempt = useCallback(
    async (word: string, guessesTakenParam: number, won: boolean) => {
      if (!session?.user?.id) {
        toast.error("You must be logged in to save your Wordle score.");
        return;
      }

      try {
        const response = await fetch("/api/wordle-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetWord: word,
            guessesTaken: guessesTakenParam,
            isWin: won,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to save Wordle attempt:", errorData);
          toast.error(
            errorData.message || "Failed to save your game progress."
          );
        }
      } catch (error) {
        console.error("Error calling API to save Wordle attempt:", error);
        toast.error(
          "An unexpected error occurred while saving your game progress."
        );
      }
    },
    [session]
  );

  const handleSubmitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast.warning(`Word must be ${WORD_LENGTH} letters long.`);
      return;
    }

    if (!validFiveLetterWords.includes(currentGuess.toUpperCase())) {
      toast.warning("Not a valid word");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      const newStreak = invalidGuessStreak + 1;
      setInvalidGuessStreak(newStreak);

      if (newStreak >= INVALID_GUESS_SUGGESTION_THRESHOLD) {
        const possibleHints = validFiveLetterWords.filter(
          (word) => word !== targetWord
        );
        if (possibleHints.length > 0) {
          const randomHint =
            possibleHints[Math.floor(Math.random() * possibleHints.length)];
          setSuggestedWordHint(randomHint);
          setShowSuggestionButton(true);
        }
      }
      return;
    }

    // Reset streak and suggestion if a valid word from the list is submitted
    setInvalidGuessStreak(0);
    setShowSuggestionButton(false);
    setSuggestedWordHint(null);

    const activeGuessIndex = guesses.findIndex((g) =>
      g.statuses.every((s) => s === "empty")
    );
    if (activeGuessIndex === -1 || gameStatus !== "playing") return;

    const newStatuses: LetterStatus[] = Array(WORD_LENGTH).fill("absent");
    const targetWordLetterCounts: { [key: string]: number } = {};
    for (const letter of targetWord) {
      targetWordLetterCounts[letter] =
        (targetWordLetterCounts[letter] || 0) + 1;
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentGuess[i] === targetWord[i]) {
        newStatuses[i] = "correct";
        targetWordLetterCounts[currentGuess[i]]--;
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (
        newStatuses[i] !== "correct" &&
        targetWord.includes(currentGuess[i]) &&
        targetWordLetterCounts[currentGuess[i]] > 0
      ) {
        newStatuses[i] = "present";
        targetWordLetterCounts[currentGuess[i]]--;
      }
    }

    const newGuesses = [...guesses];
    newGuesses[activeGuessIndex] = {
      word: currentGuess,
      statuses: newStatuses,
    };
    setGuesses(newGuesses);

    const updatedKeyboardStatuses = { ...keyboardStatuses };
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = currentGuess[i];
      const currentStatus = updatedKeyboardStatuses[letter];
      const newStatus = newStatuses[i];
      if (
        !currentStatus ||
        newStatus === "correct" ||
        (newStatus === "present" && currentStatus !== "correct")
      ) {
        updatedKeyboardStatuses[letter] = newStatus;
      }
    }
    setKeyboardStatuses(updatedKeyboardStatuses);

    if (currentGuess === targetWord) {
      setGameStatus("won");
      const winningGuessIndex = newGuesses.findIndex(
        (g) => g.word === targetWord
      );
      const actualGuessesTaken = winningGuessIndex + 1;
      recordWordleAttempt(targetWord, actualGuessesTaken, true);
      toast.success("You Won!", {
        description: `The word was: ${targetWord}. You guessed it in ${actualGuessesTaken} tries.`,
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 5000,
      });
    } else if (activeGuessIndex === MAX_GUESSES - 1) {
      setGameStatus("lost");
      recordWordleAttempt(targetWord, MAX_GUESSES, false);
      toast.error("Game Over!", {
        description: `The word was: ${targetWord}.`,
        icon: <AlertCircle className="w-5 h-5" />,
        duration: 5000,
      });
    }

    setCurrentGuess("");
  }, [
    currentGuess,
    guesses,
    gameStatus,
    targetWord,
    keyboardStatuses,
    validFiveLetterWords,
    invalidGuessStreak,
    setInvalidGuessStreak,
    setIsShaking,
    setShowSuggestionButton,
    setSuggestedWordHint,
    recordWordleAttempt,
  ]);

  const handleVirtualKeyClick = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;

      if (key === "ENTER") {
        handleSubmitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        VALID_KEYS.includes(key) &&
        currentGuess.length < WORD_LENGTH
      ) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameStatus, currentGuess.length, handleSubmitGuess]
  );

  // ** Suggestion Logic ** //
  const handleShowSuggestion = useCallback(() => {
    if (suggestedWordHint) {
      setCurrentGuess(suggestedWordHint);
      setShowSuggestionButton(false);
      setInvalidGuessStreak(0);
      setSuggestedWordHint(null);
      // Optionally, focus the input or allow immediate submission if desired
    }
  }, [
    suggestedWordHint,
    setCurrentGuess,
    setShowSuggestionButton,
    setInvalidGuessStreak,
    setSuggestedWordHint,
  ]);

  // ** Effects ** //
  useEffect(() => {
    setIsMounted(true);
    initializeGame();
    setIsInstructionsModalOpen(false);
  }, [
    initializeGame,
    setIsInstructionsModalOpen,
    setIsMounted,
    validFiveLetterWords,
  ]);

  useEffect(() => {
    if (gameStatus !== "playing" || isInstructionsModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return; // Ignore system shortcuts
      const key = event.key.toUpperCase();

      if (key === "ENTER") {
        handleSubmitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        VALID_KEYS.includes(key) &&
        currentGuess.length < WORD_LENGTH &&
        key.length === 1 // Ensure it's a single character key
      ) {
        setCurrentGuess((prev) => prev + key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus, handleSubmitGuess, isInstructionsModalOpen]);

  // ** UI Rendering ** //
  if (targetWord === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 bg-card border border-border/50 rounded-lg shadow-lg max-w-lg mx-auto mt-10 sm:mt-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">
          Error Loading Game
        </h2>
        <p className="text-muted-foreground">
          There was an issue initializing Chess Wordle. No valid words of the
          required length found in the word list.
        </p>
        <Button
          onClick={initializeGame}
          className="mt-6"
          aria-label="Try again to load game"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!isMounted || !targetWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-xl text-muted-foreground">Loading Chess Wordle...</p>
      </div>
    );
  }

  const currentGuessRowIndex = guesses.findIndex((g) =>
    g.statuses.every((s) => s === "empty")
  );

  // Helper to render example words in the instructions modal
  const renderExampleWord = (
    word: string,
    statuses: Partial<Record<string, LetterStatus>>,
    description: string
  ) => (
    <div className="mb-4">
      <div className="flex gap-1 mb-1.5">
        {word.split("").map((letter, index) => (
          <div
            key={index}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 border rounded flex items-center justify-center text-base sm:text-lg font-bold uppercase",
              statuses[letter] === "correct" &&
                "bg-green-500 border-green-600 text-white",
              statuses[letter] === "present" &&
                "bg-yellow-500 border-yellow-600 text-white",
              statuses[letter] === "absent" &&
                "bg-muted border-muted-foreground/50 text-muted-foreground",
              !statuses[letter] && "bg-card border-border"
            )}
          >
            {letter}
          </div>
        ))}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
        <strong
          className={cn(
            statuses[Object.keys(statuses)[0]] === "correct" &&
              "text-green-400",
            statuses[Object.keys(statuses)[0]] === "present" &&
              "text-yellow-400",
            statuses[Object.keys(statuses)[0]] === "absent" &&
              "text-muted-foreground"
          )}
        >
          {Object.keys(statuses)[0]}
        </strong>{" "}
        {description}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 max-w-2xl w-full mx-auto">
      <div className="flex flex-col items-center w-full mb-4 sm:mb-6 px-2 gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary text-center">
          Chess Wordle
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                aria-label="Show instructions"
                onClick={() => setIsInstructionsModalOpen(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm"
              >
                <Info className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                <div>
                  <span className="hidden sm:inline">How to Play</span>
                  <span className="sm:hidden">Instructions</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show instructions</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Instructions Modal */}
      <Dialog
        open={isInstructionsModalOpen}
        onOpenChange={setIsInstructionsModalOpen}
      >
        <DialogContent className="w-[90vw] max-w-lg sm:max-w-md bg-card/95 backdrop-blur-sm text-foreground p-0 rounded-lg">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-primary">
              How To Play
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <p>
              Guess the <strong className="text-primary">{CHESS_WORDLE}</strong>{" "}
              in {MAX_GUESSES} tries.
            </p>
            <ul className="list-disc list-outside pl-4 sm:pl-5 space-y-1 sm:space-y-1.5 text-muted-foreground">
              <li>
                Each guess must be a valid {WORD_LENGTH}-letter chess-related
                word.
              </li>
              <li>
                The color of the tiles will change to show how close your guess
                was to the word.
              </li>
              <li>
                If you make {INVALID_GUESS_SUGGESTION_THRESHOLD} incorrect (not
                in word list) guesses in a row, a suggestion button for a valid
                word might appear to help you out!
              </li>
            </ul>

            <hr className="border-border/50 my-4" />
            <h3 className="text-lg font-semibold mb-2 text-center">Examples</h3>

            {renderExampleWord(
              "BOARD",
              { B: "correct" },
              "is in the word and in the correct spot."
            )}
            {renderExampleWord(
              "PAWNS",
              { W: "present" },
              "is in the word but in the wrong spot."
            )}
            {renderExampleWord(
              "CHECK",
              { K: "absent" },
              "is not in the word in any spot."
            )}

            <hr className="border-border/50 my-4" />
            <p className="text-center text-muted-foreground italic pt-2">
              A new puzzle is available each day!
            </p>
            <p className="text-center text-muted-foreground font-semibold pt-2">
              Unlike traditional Wordle, you can play new words as many times as
              you like by pressing &apos;Play Again&apos;!
            </p>
          </div>
          <DialogClose asChild></DialogClose>
        </DialogContent>
      </Dialog>

      {/* Game Board */}
      <div
        className={cn(
          "grid gap-1.5 mb-6 sm:mb-8",
          isShaking && "animate-shake" // Apply shake animation
        )}
      >
        {guesses.map((guess, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid grid-cols-${WORD_LENGTH} gap-1 sm:gap-1.5`}
          >
            {Array.from({ length: WORD_LENGTH }).map((_, letterIndex) => {
              const letter =
                rowIndex === currentGuessRowIndex
                  ? currentGuess[letterIndex] || ""
                  : guess.word[letterIndex] || "";
              const status =
                rowIndex === currentGuessRowIndex
                  ? "empty"
                  : guess.statuses[letterIndex];
              return (
                <div
                  key={letterIndex}
                  aria-label={`Letter ${letterIndex + 1} of guess ${rowIndex + 1}: ${letter || "empty"}, status: ${status}`}
                  className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 rounded flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold uppercase transition-all duration-300",
                    status === "correct" &&
                      "bg-green-500 border-green-600 text-white rotate-[360deg]",
                    status === "present" &&
                      "bg-yellow-500 border-yellow-600 text-white",
                    status === "absent" &&
                      "bg-muted border-muted-foreground/50 text-muted-foreground",
                    status === "empty" && "bg-background border-border",
                    rowIndex === currentGuessRowIndex &&
                      currentGuess[letterIndex] &&
                      "scale-105 border-primary"
                  )}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* On-screen Keyboard */}
      <div className="w-full space-y-1.5 sm:space-y-2">
        {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, KbdRowIndex) => (
          <div
            key={KbdRowIndex}
            className={`flex justify-center gap-1 sm:gap-1.5 w-full`}
          >
            {KbdRowIndex === 2 && (
              <Button
                onClick={() => handleVirtualKeyClick("ENTER")}
                aria-label="Submit guess"
                className="h-12 sm:h-14 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 flex-[1.5] sm:flex-none sm:min-w-[4rem] md:min-w-[5rem] bg-primary/80 hover:bg-primary text-primary-foreground"
                disabled={
                  gameStatus !== "playing" ||
                  currentGuess.length !== WORD_LENGTH
                }
              >
                ENTER
              </Button>
            )}
            {row.split("").map((key) => {
              const keyStatus = keyboardStatuses[key];
              return (
                <Button
                  key={key}
                  onClick={() => handleVirtualKeyClick(key)}
                  aria-label={`Keyboard key ${key}`}
                  variant="outline"
                  className={cn(
                    "h-12 sm:h-14 text-xs sm:text-sm font-bold flex-1 p-0",
                    "max-w-[2.5rem] sm:max-w-[3rem] md:max-w-[3.5rem]",
                    keyStatus === "correct" &&
                      "bg-green-500 border-green-600 text-white hover:bg-green-600",
                    keyStatus === "present" &&
                      "bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-600",
                    keyStatus === "absent" &&
                      "bg-muted border-muted-foreground/50 text-muted-foreground hover:bg-muted/80",
                    gameStatus !== "playing" && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={gameStatus !== "playing"}
                >
                  {key}
                </Button>
              );
            })}
            {KbdRowIndex === 2 && (
              <Button
                onClick={() => handleVirtualKeyClick("BACKSPACE")}
                variant="outline"
                aria-label="Backspace or delete last letter"
                className="h-12 sm:h-14 px-2 sm:px-3 flex-[1.5] sm:flex-none sm:min-w-[4rem] md:min-w-[5rem] text-lg sm:text-xl"
                disabled={gameStatus !== "playing"}
              >
                ⌫
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Suggestion Button */}
      {showSuggestionButton && suggestedWordHint && (
        <div className="mt-4 sm:mt-6 text-center w-full flex justify-center">
          <Button
            onClick={handleShowSuggestion}
            variant="outline"
            className="w-full sm:w-auto max-w-xs border-primary text-primary hover:bg-primary/10"
            aria-label={`Get a hint: ${suggestedWordHint}`}
          >
            Need a hint? Try: {suggestedWordHint}
          </Button>
        </div>
      )}

      {/* Game Status / Play Again */}
      {(gameStatus === "won" || gameStatus === "lost") && (
        <div className="mt-6 sm:mt-8 text-center w-full flex justify-center">
          <Button
            onClick={initializeGame}
            className="w-full sm:w-auto max-w-xs"
            size="lg"
            aria-label="Play Again"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Play Again
          </Button>
        </div>
      )}
    </div>
  );
}
