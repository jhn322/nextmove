import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import type { StockfishEngine } from "../types/types";
import { Bot } from "@/components/game/data/bots";

export const useStockfish = (
  game: Chess,
  selectedBot: Bot | null,
  makeMove: (
    from: string,
    to: string,
    promotion?: "q" | "r" | "n" | "b"
  ) => boolean
) => {
  const [engine, setEngine] = useState<StockfishEngine | null>(null);

  const setEngineOptions = useCallback(
    (engine: StockfishEngine) => {
      if (selectedBot) {
        engine.postMessage(
          "setoption name Skill Level value " + selectedBot.skillLevel
        );
        engine.postMessage("setoption name MultiPV value 3");
        engine.postMessage("setoption name Contempt value 0");
      }
    },
    [selectedBot]
  );

  const getBotMove = useCallback(() => {
    if (engine && !game.isGameOver() && selectedBot) {
      setTimeout(() => {
        engine.postMessage("position fen " + game.fen());
        engine.postMessage(
          `go depth ${selectedBot.depth} movetime ${selectedBot.moveTime}`
        );
      }, 1500);
    }
  }, [engine, game, selectedBot]);

  useEffect(() => {
    const stockfish = new Worker("/stockfish.js");

    stockfish.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.startsWith("bestmove")) {
        const moveStr = message.split(" ")[1];
        if (!game.isGameOver()) {
          const from = moveStr.slice(0, 2);
          const to = moveStr.slice(2, 4);
          const promotion =
            moveStr.length > 4
              ? (moveStr.slice(4, 5) as "q" | "r" | "n" | "b")
              : undefined;
          makeMove(from, to, promotion);
        }
      }
    };

    setEngine(stockfish);
    stockfish.postMessage("uci");
    setEngineOptions(stockfish);

    return () => {
      stockfish.terminate();
    };
  }, [selectedBot, makeMove, game, setEngineOptions]);

  return {
    engine,
    getBotMove,
  };
};
