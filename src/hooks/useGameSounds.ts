import { useCallback } from "react";

type SoundType =
  | "move-self" // Player move
  | "move-opponent" // Bot move
  | "capture" // Capturing a piece
  | "check" // Check
  | "castle" // Castling move
  | "game-start" // Game start
  | "game-end" // Game won/lost
  | "game-draw" // Game drawn
  | "decline" // Resignation/Decline
  | "illegal" // Illegal move
  | "choice" // Menu selection
  | "correct" // Success action
  | "incorrect" // Error action
  | "click" // UI click
  | "promote" // Pawn promotion
  | "premove" // Pre-move
  | "scatter" // Piece scatter
  | "tenseconds"; // Time warning

const soundFiles = {
  "move-self": "/sounds/move-self.mp3",
  "move-opponent": "/sounds/move-opponent.mp3",
  capture: "/sounds/capture.mp3",
  castle: "/sounds/castle.mp3",
  check: "/sounds/check.mp3",
  "game-start": "/sounds/game-start.mp3",
  "game-end": "/sounds/game-end.mp3",
  "game-draw": "/sounds/game-draw.mp3",
  decline: "/sounds/decline.mp3",
  illegal: "/sounds/illegal.mp3",
  choice: "/sounds/choice.mp3",
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  click: "/sounds/click.mp3",
  promote: "/sounds/promote.mp3",
  premove: "/sounds/premove.mp3",
  scatter: "/sounds/scatter.mp3",
  tenseconds: "/sounds/tenseconds.mp3",
};

const audioCache: { [key: string]: HTMLAudioElement } = {};

export const useGameSounds = () => {
  const playSound = useCallback((type: SoundType) => {
    const soundFile = soundFiles[type];

    if (!soundFile) return;

    // Try to get cached audio element
    let audio = audioCache[type];

    // Create and cache new audio element if needed
    if (!audio) {
      audio = new Audio(soundFile);
      audioCache[type] = audio;
    }

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Error playing sound:", err));
  }, []);

  return { playSound };
};
