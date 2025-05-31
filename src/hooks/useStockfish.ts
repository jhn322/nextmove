import { useState, useEffect, useCallback, useRef } from "react";
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

  // Store stable references
  const gameRef = useRef(game);
  const makeMoveRef = useRef(makeMove);
  const selectedBotRef = useRef(selectedBot);

  // Update refs on every render without useEffect to avoid loops
  gameRef.current = game;
  makeMoveRef.current = makeMove;
  selectedBotRef.current = selectedBot;

  const getBotMove = useCallback(() => {
    if (engine && !gameRef.current.isGameOver() && selectedBotRef.current) {
      setTimeout(() => {
        engine.postMessage("position fen " + gameRef.current.fen());
        engine.postMessage(
          `go depth ${selectedBotRef.current!.depth} movetime ${selectedBotRef.current!.moveTime}`
        );
      }, 1500);
    }
  }, [engine]);

  // Only create/destroy engine when selectedBot changes
  useEffect(() => {
    if (!selectedBot) {
      setEngine(null);
      return;
    }

    const stockfish = new Worker("/stockfish.js");

    stockfish.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.startsWith("bestmove")) {
        const moveStr = message.split(" ")[1];
        if (!gameRef.current.isGameOver()) {
          const from = moveStr.slice(0, 2);
          const to = moveStr.slice(2, 4);
          const promotion =
            moveStr.length > 4
              ? (moveStr.slice(4, 5) as "q" | "r" | "n" | "b")
              : undefined;
          makeMoveRef.current(from, to, promotion);
        }
      }
    };

    // Initialize engine
    stockfish.postMessage("uci");
    stockfish.postMessage(
      "setoption name Skill Level value " + selectedBot.skillLevel
    );
    stockfish.postMessage("setoption name MultiPV value 3");
    stockfish.postMessage("setoption name Contempt value 0");

    setEngine(stockfish);

    return () => {
      stockfish.terminate();
      setEngine(null);
    };
  }, [selectedBot?.id]);

  return {
    engine,
    getBotMove,
  };
};
