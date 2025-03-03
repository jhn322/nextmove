import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserSettings } from "@/lib/mongodb-service";

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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { session, status } = useAuth();

  // Preload critical sound files
  useEffect(() => {
    if (typeof window === "undefined") return;

    // List of critical sounds to preload
    const criticalSounds: SoundType[] = [
      "game-end",
      "game-start",
      "check",
      "capture",
    ];

    // Only preload if the user has interacted with the page
    if (hasInteracted) {
      criticalSounds.forEach((type) => {
        const soundFile = soundFiles[type];
        if (soundFile) {
          try {
            const audio = new Audio(soundFile);
            audio.preload = "auto";
            // Just load it, don't play
            audio.load();
            // Store in cache
            audioCache[type] = audio;
            console.log(`Preloaded sound: ${type}`);
          } catch (err) {
            console.error(`Failed to preload sound ${type}:`, err);
          }
        }
      });
    }
  }, [hasInteracted]);

  // Load sound settings from user settings
  useEffect(() => {
    async function loadSoundSettings() {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const settings = await getUserSettings(session.user.id);
          if (settings) {
            setSoundEnabled(settings.sound_enabled);
          }
        } catch (error) {
          console.error("Unexpected error loading sound settings:", error);
        }
      }
    }

    loadSoundSettings();
  }, [session, status]);

  // Check if user has interacted with the document
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    if (document.readyState === "complete" && document.hasFocus()) {
      setHasInteracted(true);
    }

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      // Skip if sound is disabled in user settings
      if (!soundEnabled) return;

      const soundFile = soundFiles[type];

      if (!soundFile) {
        console.warn(`Sound file not found for type: ${type}`);
        return;
      }

      // Skip playing sound if user hasn't interacted with the board yet
      if (!hasInteracted && typeof window !== "undefined") {
        console.log("Sound not played: waiting for user interaction");
        return;
      }

      try {
        // Try to get cached audio element
        let audio = audioCache[type];

        // Create and cache new audio element if needed
        if (!audio) {
          audio = new Audio(soundFile);
          audioCache[type] = audio;
        }

        // Reset and play
        audio.currentTime = 0;

        // Add event listener for errors
        const handleError = (e: ErrorEvent) => {
          console.error(`Error loading sound ${type}: ${e.message}`);
          // Remove the problematic audio from cache
          delete audioCache[type];
          audio.removeEventListener("error", handleError as EventListener);
        };

        audio.addEventListener("error", handleError as EventListener);

        audio.play().catch((err) => {
          if (err.name === "NotAllowedError") {
            console.log("Sound not allowed: user interaction required");
          } else {
            console.error(`Error playing sound ${type}:`, err);
            // Remove the problematic audio from cache
            delete audioCache[type];
          }
        });
      } catch (err) {
        console.error(`Unexpected error playing sound ${type}:`, err);
      }
    },
    [hasInteracted, soundEnabled]
  );

  return { playSound, soundEnabled };
};
