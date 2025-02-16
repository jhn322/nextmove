import { useState, useEffect, useCallback } from "react";
import { useWindowSize } from "react-use";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Chess } from "chess.js";
import { Crown } from "lucide-react";
import Confetti from "react-confetti";

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRematch: () => void;
  onNewBot: () => void;
  game: Chess;
  difficulty: string;
  isResignation?: boolean;
  onConfirmResign?: () => void;
  playerColor: "w" | "b";
}

const VictoryModal = ({
  isOpen,
  onClose,
  onRematch,
  onNewBot,
  game,
  difficulty,
  isResignation = false,
  onConfirmResign,
  playerColor,
}: VictoryModalProps) => {
  const [message, setMessage] = useState<string | React.ReactNode>("");
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRecycling, setIsRecycling] = useState(false);

  const isPlayerWinner = useCallback(() => {
    if (game.isCheckmate() || game.isGameOver()) {
      const winningColor = game.turn() === "w" ? "Black" : "White";
      return winningColor.toLowerCase() === playerColor;
    }
    return false;
  }, [game, playerColor]);

  const renderWinnerText = useCallback(() => {
    if (isResignation) {
      return "Are you sure you want to resign?";
    }
    if (game.isCheckmate() || game.isGameOver()) {
      const winningColor = game.turn() === "w" ? "Black" : "White";
      const coloredText =
        winningColor.toLowerCase() === playerColor ? (
          <span className="text-blue-400">Player</span>
        ) : (
          <span className="text-red-400">Bot</span>
        );
      return <>{coloredText} Won!</>;
    }
    if (game.isDraw()) {
      if (game.isStalemate()) return "Draw by Stalemate!";
      if (game.isThreefoldRepetition()) return "Draw by Repetition!";
      if (game.isInsufficientMaterial())
        return "Draw by Insufficient Material!";
      return "Game is a Draw!";
    }
    return "Game Over!";
  }, [game, isResignation, playerColor]);

  // Confetti on victory
  useEffect(() => {
    if (isOpen) {
      setMessage(renderWinnerText());
      setShowConfetti(isPlayerWinner());
      setIsRecycling(true);

      const recycleTimer = setTimeout(() => {
        setIsRecycling(false);
      }, 2000);

      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      return () => {
        clearTimeout(recycleTimer);
        clearTimeout(confettiTimer);
      };
    } else {
      setShowConfetti(false);
      setIsRecycling(false);
    }
  }, [isOpen, renderWinnerText, game, isPlayerWinner]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={isRecycling}
          numberOfPieces={400}
          gravity={0.1}
          style={{ position: "fixed", zIndex: 100 }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {message}
            </DialogTitle>
            {!isResignation && (
              <DialogDescription className="text-center pt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                  <Crown className="h-6 w-6 text-blue-400" strokeWidth={2} />
                  <span>Player</span>
                  <span className="text-muted-foreground">
                    ({playerColor === "w" ? "White" : "Black"})
                  </span>
                  <span className="text-muted-foreground mx-2">vs</span>
                  <span>Bot</span>
                  <span className="text-muted-foreground">
                    ({playerColor === "w" ? "Black" : "White"})
                  </span>
                  <Crown className="h-6 w-6 text-red-400" strokeWidth={2} />
                </div>
                <div className="text-base font-medium text-muted-foreground capitalize">
                  {difficulty} Difficulty
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            {isResignation ? (
              <>
                <Button
                  onClick={onConfirmResign}
                  variant="destructive"
                  className="flex-1"
                >
                  Confirm
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onRematch}
                  variant="default"
                  className="flex-1"
                >
                  Rematch
                </Button>
                <Button onClick={onNewBot} variant="outline" className="flex-1">
                  New Bot
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VictoryModal;
