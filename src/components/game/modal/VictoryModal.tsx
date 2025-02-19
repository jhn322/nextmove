import { useState, useEffect, useCallback } from "react";
import { Bot } from "@/components/game/data/bots";
import { useWindowSize } from "react-use";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Chess } from "chess.js";
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
  handleNewBotDialog: () => void;
  selectedBot: Bot | null;
  playerName: string;
}

const VictoryModal = ({
  isOpen,
  onClose,
  onRematch,
  game,
  difficulty,
  isResignation = false,
  onConfirmResign,
  playerColor,
  onNewBot,
  selectedBot,
  playerName,
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
    if (game.isDraw()) {
      if (game.isStalemate()) return "Stalemate - game is a draw!";
      if (game.isThreefoldRepetition()) return "Draw by repetition!";
      if (game.isInsufficientMaterial())
        return "Draw by insufficient material!";
      return "Game is a draw!";
    }
    if (game.isCheckmate() || game.isGameOver()) {
      const winningColor = game.turn() === "w" ? "Black" : "White";
      const isPlayerWon = winningColor.toLowerCase() === playerColor;
      const winnerName = isPlayerWon ? playerName : selectedBot?.name || "Bot";
      return (
        <>
          <span className={isPlayerWon ? "text-blue-400" : "text-red-400"}>
            {winnerName}
          </span>{" "}
          won!
          <br />
          {isPlayerWon ? (
            <span className="text-green-500">
              Congratulations on your victory!
            </span>
          ) : (
            <span className="text-yellow-500 ">
              You&apos;ll get them next time!
            </span>
          )}
        </>
      );
    }
    return (
      <>
        <span className="text-red-400">{selectedBot?.name || "Bot"}</span> won
        by resignation!
      </>
    );
  }, [game, isResignation, playerColor, selectedBot, playerName]);

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
        <DialogContent className="sm:max-w-lg w-[95%] mx-auto p-4 sm:p-6 rounded-lg border bg-background shadow-lg">
          <div className="absolute right-2 top-2 sm:right-4 sm:top-4">
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            ></button>
          </div>
          <DialogHeader className="mt-1">
            <DialogTitle className="text-center text-xl sm:text-2xl font-bold break-words">
              {message}
            </DialogTitle>
            {!isResignation && (
              <DialogDescription className="text-center pt-2 sm:pt-4 space-y-2">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-base sm:text-lg font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
                      <AvatarImage src="/default-pfp.png" alt="Player" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <span>{playerName}</span>
                    <span className="text-muted-foreground text-sm sm:text-base">
                      ({playerColor === "w" ? "White" : "Black"})
                    </span>
                  </div>
                  <span className="text-muted-foreground mx-2">vs</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
                      <AvatarImage
                        src={selectedBot?.image}
                        alt={selectedBot?.name}
                      />
                      <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <span>{selectedBot?.name || "Bot"}</span>
                    <span className="text-muted-foreground text-sm sm:text-base">
                      ({playerColor === "w" ? "Black" : "White"})
                    </span>
                  </div>
                </div>
                <div className="text-sm sm:text-base font-medium text-muted-foreground capitalize">
                  {difficulty} Difficulty
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex gap-2 sm:gap-3 pt-4">
            {isResignation ? (
              <>
                <Button
                  onClick={onConfirmResign}
                  variant="destructive"
                  className="flex-1 text-sm sm:text-base py-2 h-auto"
                >
                  Confirm
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-2 h-auto"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onRematch}
                  variant="default"
                  className="flex-1 text-sm sm:text-base py-2 h-auto"
                >
                  Rematch
                </Button>
                <Button
                  onClick={onNewBot}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-2 h-auto"
                >
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
