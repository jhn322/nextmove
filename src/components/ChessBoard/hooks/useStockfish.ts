import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { DIFFICULTY_LEVELS } from "../constants";
import type { StockfishEngine } from "../types/types";

export const useStockfish = (
  game: Chess,
  difficulty: string,
  makeMove: (from: string, to: string) => boolean
) => {
  const [engine, setEngine] = useState<StockfishEngine | null>(null);

  // Get skill level based on difficulty
  const skillLevel =
    DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS] || 10;

  const setSkillLevel = useCallback(
    (level: number) => {
      if (engine) {
        engine.postMessage("setoption name Skill Level value " + level);
      }
    },
    [engine]
  );

  // Get bot's move
  const getBotMove = useCallback(() => {
    if (engine && !game.isGameOver()) {
      engine.postMessage("position fen " + game.fen());
      engine.postMessage("go movetime 1000"); // Think for 1 second
    }
  }, [engine, game]);

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
    stockfish.postMessage("setoption name Skill Level value " + skillLevel);

    return () => {
      stockfish.terminate();
    };
  }, [difficulty, makeMove, game, skillLevel]);

  return {
    engine,
    getBotMove,
    setSkillLevel,
  };
};
