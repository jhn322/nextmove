import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import type { StockfishEngine } from "../types/types";

export const useHintEngine = () => {
  const [engine, setEngine] = useState<StockfishEngine | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    const stockfish = new Worker("/stockfish.js");

    stockfish.postMessage("uci");
    stockfish.postMessage("setoption name Skill Level value 20");
    stockfish.postMessage("setoption name MultiPV value 1");

    setEngine(stockfish);

    return () => {
      stockfish.terminate();
    };
  }, []);

  const getHint = useCallback(
    (game: Chess, callback: (from: string, to: string) => void) => {
      if (!engine || game.isGameOver() || typeof window === "undefined") return;

      setIsCalculating(true);

      const handleMessage = (event: MessageEvent) => {
        const message = event.data;
        if (message.startsWith("bestmove")) {
          setIsCalculating(false);
          const moveStr = message.split(" ")[1];
          if (moveStr && moveStr !== "(none)") {
            callback(moveStr.slice(0, 2), moveStr.slice(2, 4));
          }
          engine.removeEventListener("message", handleMessage);
        }
      };

      engine.addEventListener("message", handleMessage);
      engine.postMessage("position fen " + game.fen());
      engine.postMessage("go depth 15 movetime 1000");
    },
    [engine]
  );

  return {
    getHint,
    isCalculating,
  };
};
