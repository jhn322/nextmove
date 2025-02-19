import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "@/components/game/data/bots";
import { Chess } from "chess.js";
import BotMessageBubble from "../board/botMessageBubble";
import { botMessages } from "@/components/game/data/botMessages";
import type { MessageCondition } from "@/components/game/data/botMessages";
import Image from "next/image";

interface PlayerProfileProps {
  difficulty: string;
  isBot: boolean;
  rating?: number;
  capturedPieces?: string[];
  flag?: string;
  selectedBot?: Bot | null;
  lastMove?: { from: string; to: string } | null;
  game?: Chess;
  playerColor?: "w" | "b";
}

const PlayerProfile = ({
  difficulty,
  isBot,
  rating = 1500,
  capturedPieces = [],
  selectedBot,
  lastMove,
  game,
  playerColor,
}: PlayerProfileProps) => {
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);
  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  useEffect(() => {
    if (isBot && lastMove && game) {
      // Only show message if it's not the player's turn (meaning bot just moved)
      const isBotTurn = game.turn() === (playerColor === "w" ? "b" : "w");
      if (!isBotTurn) {
        // Get the last move details
        const moveHistory = game.history({ verbose: true });
        const lastMoveDetails = moveHistory[moveHistory.length - 1];

        // Determine message conditions
        const conditions: MessageCondition = {};

        // Add game end conditions first
        if (game.isGameOver()) {
          if (game.isCheckmate()) {
            // If it's checkmate, the player who just moved won
            conditions.gameEnd = isBotTurn ? "defeat" : "victory";
          } else if (game.isDraw()) {
            conditions.gameEnd = "draw"; // Set gameEnd to "draw" if the game is a draw
          }
        }

        // Only add other conditions if the game is not over
        if (!conditions.gameEnd) {
          conditions.check = game.isCheck();
          conditions.capture = !!lastMoveDetails?.captured;
          conditions.castle = lastMoveDetails?.san.includes("O-O");
          conditions.promotion = lastMoveDetails?.san.includes("=");
          conditions.advantage = "equal" as const;
        }

        // Find matching message
        const matchingMessages =
          botMessages.find((category) =>
            Object.entries(category.conditions).every(([key, value]) => {
              const conditionKey = key as keyof MessageCondition;
              return conditions[conditionKey] === value;
            })
          ) || botMessages[botMessages.length - 1]; // Use default if no match

        // Select random message from matching category
        const newMessage =
          matchingMessages.messages[
            Math.floor(Math.random() * matchingMessages.messages.length)
          ];

        setMessage(newMessage);
        setShowMessage(true);

        // For game end messages, show them longer
        const timer = setTimeout(
          () => {
            setShowMessage(false);
          },
          conditions.gameEnd ? 5000 : 3000
        );

        return () => clearTimeout(timer);
      }
    }
  }, [isBot, lastMove, game, playerColor]);

  return (
    <div className="relative">
      <Card className="sm:w-[180px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-2">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage
              src={
                isBot && selectedBot ? selectedBot.image : "/default-pfp.png"
              }
              alt={
                isBot
                  ? selectedBot?.name || `${capitalizedDifficulty} Bot`
                  : "Player"
              }
              className="object-contain bg-gray-800 dark:bg-gray-700"
            />
            <AvatarFallback>
              {isBot ? difficulty.substring(0, 2).toUpperCase() : "P"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium leading-none">
                {isBot
                  ? selectedBot?.name || `${capitalizedDifficulty} Bot`
                  : "Player"}
              </span>
              {isBot && selectedBot && (
                <Image
                  src={selectedBot.flag}
                  alt={`${selectedBot.name} flag`}
                  className="w-5 h-3"
                  width={20}
                  height={12}
                />
              )}
            </div>
            <CardDescription className="text-[11px]">
              Rating: {isBot && selectedBot ? selectedBot.rating : rating}
            </CardDescription>
          </div>
        </CardHeader>
        {capturedPieces.length > 0 && (
          <CardContent className="p-1 pt-0">
            <div className="flex flex-wrap gap-0.5">
              {capturedPieces.map((piece, index) => (
                <div key={index} className="w-2 h-2">
                  {piece}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      {isBot && (
        <BotMessageBubble
          message={message}
          isVisible={showMessage}
          position="bottom"
        />
      )}
    </div>
  );
};

export default PlayerProfile;
