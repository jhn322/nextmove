"use client";

import { useState, useEffect, useCallback } from "react";
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

// ** Constants ** //
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const VALID_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

  // ** Game Initialization and Reset ** //
  const initializeGame = useCallback(() => {
    const validWords = CHESS_WORDLE_WORDS.filter(
      (word) => word.length === WORD_LENGTH
    );
    if (validWords.length === 0) {
      toast.error(
        "No valid words of the required length found. Please check word list."
      );
      setGameStatus("idle");
      setTargetWord("ERROR");
      return;
    }
    const newWord =
      validWords[Math.floor(Math.random() * validWords.length)].toUpperCase();
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
    setIsInstructionsModalOpen(true);
  }, []);

  // ** Game Logic Functions ** //
  const handleSubmitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      return;
    }

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
    } else if (activeGuessIndex === MAX_GUESSES - 1) {
      setGameStatus("lost");
      setTimeout(
        () => toast.error(`Game Over! The word was ${targetWord}.`),
        500
      );
    }

    setCurrentGuess("");
  }, [currentGuess, guesses, gameStatus, targetWord, keyboardStatuses]);

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

  // ** Effects ** //
  useEffect(() => {
    setIsMounted(true);
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameStatus !== "playing" || isInstructionsModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;
      const key = event.key.toUpperCase();

      if (key === "ENTER") {
        handleSubmitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        VALID_KEYS.includes(key) &&
        currentGuess.length < WORD_LENGTH &&
        key.length === 1
      ) {
        setCurrentGuess((prev) => prev + key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentGuess,
    gameStatus,
    targetWord,
    handleSubmitGuess,
    isInstructionsModalOpen,
  ]);

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
              "w-10 h-10 sm:w-11 sm:h-11 border-2 rounded flex items-center justify-center text-lg sm:text-xl font-bold uppercase",
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
      <p className="text-sm text-muted-foreground leading-snug">
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
        <Button
          variant="outline"
          aria-label="Show instructions"
          onClick={() => setIsInstructionsModalOpen(true)}
        >
          <Info className="w-5 h-5 mr-0 sm:mr-2" />
          <div>
            <span className="hidden sm:inline">How to Play</span>
            <span className="sm:hidden">Instructions</span>
          </div>
        </Button>
      </div>

      {/* Instructions Modal */}
      <Dialog
        open={isInstructionsModalOpen}
        onOpenChange={setIsInstructionsModalOpen}
      >
        <DialogContent className="max-w-md sm:max-w-lg bg-card/95 backdrop-blur-sm text-foreground p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center text-primary">
              How To Play
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4 text-sm sm:text-base">
            <p>
              Guess the <strong className="text-primary">{CHESS_WORDLE}</strong>{" "}
              in {MAX_GUESSES} tries.
            </p>
            <ul className="list-disc list-outside pl-5 space-y-1.5 text-muted-foreground">
              <li>
                Each guess must be a valid {WORD_LENGTH}-letter chess-related
                word.
              </li>
              <li>
                The color of the tiles will change to show how close your guess
                was to the word.
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
          </div>
          <DialogClose asChild></DialogClose>
        </DialogContent>
      </Dialog>

      {/* Game Board */}
      <div className="grid gap-1.5 mb-6 sm:mb-8">
        {guesses.map((guess, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid grid-cols-${WORD_LENGTH} gap-1.5`}
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
                    "w-16 h-16 sm:w-20 sm:h-20 border-2 rounded flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase transition-all duration-300",
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
      <div className="w-full space-y-2">
        {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, KbdRowIndex) => (
          <div
            key={KbdRowIndex}
            className={`flex justify-center gap-1.5 sm:gap-2 w-full`}
          >
            {KbdRowIndex === 2 && (
              <Button
                onClick={() => handleVirtualKeyClick("ENTER")}
                aria-label="Submit guess"
                className="h-12 text-xs font-semibold px-3 sm:px-4 flex-1 sm:flex-none sm:w-20 bg-primary/80 hover:bg-primary text-primary-foreground"
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
                    "h-12 w-auto aspect-square text-sm sm:text-base font-bold flex-1 max-w-[3rem] sm:max-w-[3.5rem] p-0",
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
                className="h-12 px-3 sm:px-4 flex-1 sm:flex-none sm:w-20"
                disabled={gameStatus !== "playing"}
              >
                ⌫
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Game Status / Play Again */}
      {(gameStatus === "won" || gameStatus === "lost") && (
        <div className="mt-6 sm:mt-8 text-center p-4 sm:p-6 bg-card border border-border/50 rounded-lg shadow-md w-full">
          {gameStatus === "won" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <h2 className="text-2xl font-semibold mb-2">You Won!</h2>
              <p className="text-muted-foreground mb-1">
                The word was:{" "}
                <strong className="text-primary">{targetWord}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                You guessed it in{" "}
                {guesses.findIndex((g) => g.word === targetWord) + 1} tries.
              </p>
            </div>
          )}
          {gameStatus === "lost" && (
            <div className="flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-3" />
              <h2 className="text-2xl font-semibold mb-2">Game Over!</h2>
              <p className="text-muted-foreground mb-4">
                The word was:{" "}
                <strong className="text-primary">{targetWord}</strong>
              </p>
            </div>
          )}
          <Button
            onClick={initializeGame}
            className="w-full sm:w-auto mt-2"
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
