import { useState, useEffect } from "react";
import { Chess } from "chess.js";

interface TimerState {
  gameTime: number;
  whiteTime: number;
  blackTime: number;
}

export const useGameTimer = (
  game: Chess,
  gameStarted: boolean,
  initialState?: TimerState
) => {
  const [gameTime, setGameTime] = useState(initialState?.gameTime ?? 0);
  const [whiteTime, setWhiteTime] = useState(initialState?.whiteTime ?? 0);
  const [blackTime, setBlackTime] = useState(initialState?.blackTime ?? 0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStarted && !game.isGameOver() && !game.isResigned) {
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

  // Load saved timer values from external state
  const loadTimerState = (timerState: TimerState) => {
    setGameTime(timerState.gameTime);
    setWhiteTime(timerState.whiteTime);
    setBlackTime(timerState.blackTime);
  };

  return {
    gameTime,
    whiteTime,
    blackTime,
    resetTimers,
    loadTimerState,
  };
};
