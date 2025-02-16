import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { DIFFICULTY_LEVELS } from "../config/game";
import type { StockfishEngine } from "../types/types";

export const useStockfish = (
  game: Chess,
  difficulty: string,
  makeMove: (from: string, to: string) => boolean
) => {
  const [engine, setEngine] = useState<StockfishEngine | null>(null);

  // Get settings based on difficulty
  const settings = DIFFICULTY_LEVELS[
    difficulty as keyof typeof DIFFICULTY_LEVELS
  ] || {
    skillLevel: 10,
    depth: 5,
    moveTime: 1000,
  };

  const setEngineOptions = useCallback(
    (engine: StockfishEngine) => {
      // Set skill level (0-20)
      engine.postMessage(
        "setoption name Skill Level value " + settings.skillLevel
      );
      // Consider multiple moves, making play less perfect
      engine.postMessage("setoption name MultiPV value 3");
      // Make engine more willing to accept draws/less aggressive
      engine.postMessage("setoption name Contempt value 0");
    },
    [settings]
  );

  // Get bot's move
  const getBotMove = useCallback(() => {
    if (engine && !game.isGameOver()) {
      // Send current position
      engine.postMessage("position fen " + game.fen());
      // Start calculating with depth and time limits
      engine.postMessage(
        `go depth ${settings.depth} movetime ${settings.moveTime}`
      );
    }
  }, [engine, game, settings]);

  // Initialize Stockfish
  useEffect(() => {
    const stockfish = new Worker("/stockfish.js");

    stockfish.onmessage = (event: MessageEvent) => {
      const message = event.data;
      // When Stockfish finds the best move
      if (message.startsWith("bestmove")) {
        const moveStr = message.split(" ")[1];
        if (!game.isGameOver()) {
          // Add check to prevent moves after game over
          makeMove(moveStr.slice(0, 2), moveStr.slice(2, 4));
        }
      }
    };

    setEngine(stockfish);
    stockfish.postMessage("uci");
    setEngineOptions(stockfish);

    return () => {
      stockfish.terminate();
    };
  }, [difficulty, makeMove, game, setEngineOptions]);

  return {
    engine,
    getBotMove,
    setSkillLevel: (newDifficulty: string) => {
      if (engine) {
        const settings =
          DIFFICULTY_LEVELS[newDifficulty as keyof typeof DIFFICULTY_LEVELS];
        setEngineOptions(engine);
      }
    },
  };
};
