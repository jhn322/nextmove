import { useState, useEffect } from "react";
import { Chess } from "chess.js";

export const useGameTimer = (game: Chess, gameStarted: boolean) => {
  const [gameTime, setGameTime] = useState(0);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStarted && !game.isGameOver()) {
        // Only count if game has started
        setGameTime((prev) => prev + 1);
        if (game.turn() === "w") {
          setWhiteTime((prev) => prev + 1);
        } else {
          setBlackTime((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameStarted]);

  const resetTimers = () => {
    setGameTime(0);
    setWhiteTime(0);
    setBlackTime(0);
  };

  return {
    gameTime,
    whiteTime,
    blackTime,
    resetTimers,
  };
};
