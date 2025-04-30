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
import CapturedPieces from "./CapturedPieces";
import { CapturedPiece } from "@/lib/calculateMaterialAdvantage";
import { useAuth } from "@/context/auth-context";

interface PlayerProfileProps {
  difficulty: string;
  isBot: boolean;
  rating?: number;
  capturedPieces?: CapturedPiece[];
  flag?: string;
  selectedBot?: Bot | null;
  lastMove?: { from: string; to: string } | null;
  game?: Chess;
  playerColor?: "w" | "b";
  pieceSet?: string;
}

const PlayerProfile = ({
  difficulty,
  isBot,
  rating = 1000,
  capturedPieces = [],
  selectedBot,
  lastMove,
  game,
  playerColor = "w",
  pieceSet: initialPieceSet = "staunty",
}: PlayerProfileProps) => {
  const { session, status } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);
  const [playerName, setPlayerName] = useState<string>("Player");
  const [playerAvatar, setPlayerAvatar] = useState<string>("/default-pfp.png");
  const [countryFlag, setCountryFlag] = useState<string>("");
  const [flair, setFlair] = useState<string>("");
  const [currentPieceSet, setCurrentPieceSet] = useState(initialPieceSet);

  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  // Determine the color of the player
  const profileColor = isBot ? (playerColor === "w" ? "b" : "w") : playerColor;

  // Filter pieces captured by the player (opposite color pieces)
  const filteredPieces = capturedPieces.filter(
    (piece) => piece.color !== profileColor
  );

  // Check if there are any captured pieces to display
  const hasCapturedPieces = filteredPieces.length > 0;

  // Load player data from session or localStorage
  useEffect(() => {
    if (!isBot) {
      let loadedFromSession = false;
      // Try loading from session first if authenticated
      if (status === "authenticated" && session?.user) {
        const user = session.user;
        // Use session data, provide fallbacks
        setPlayerName(user.name || "Player");
        setPlayerAvatar(user.image || "/default-pfp.png");
        setCountryFlag(user.countryFlag || "");
        setFlair(user.flair || "");
        setCurrentPieceSet(user.pieceSet || initialPieceSet);
        loadedFromSession = true;

        // Update localStorage from session data
        localStorage.setItem("chess-player-name", user.name || "Player");
        localStorage.setItem(
          "chess-player-avatar",
          user.image || "/default-pfp.png"
        );
        localStorage.setItem("chess-player-flag", user.countryFlag || "");
        localStorage.setItem("chess-player-flair", user.flair || "");
        localStorage.setItem(
          "chess-piece-set",
          user.pieceSet || initialPieceSet
        );
      }

      // Fallback to localStorage if not loaded from session
      if (!loadedFromSession && typeof window !== "undefined") {
        const savedPlayerName = localStorage.getItem("chess-player-name");
        const savedAvatarUrl = localStorage.getItem("chess-player-avatar");
        const savedFlag = localStorage.getItem("chess-player-flag");
        const savedFlair = localStorage.getItem("chess-player-flair");
        const savedPieceSet = localStorage.getItem("chess-piece-set");

        if (savedPlayerName) setPlayerName(savedPlayerName);
        if (savedAvatarUrl) setPlayerAvatar(savedAvatarUrl);
        if (savedFlag) setCountryFlag(savedFlag);
        if (savedFlair) setFlair(savedFlair);
        if (savedPieceSet) setCurrentPieceSet(savedPieceSet);
      }
    }
    // Depend on session user object directly, status, and isBot
  }, [isBot, session?.user, status, initialPieceSet]);

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
              src={isBot && selectedBot ? selectedBot.image : playerAvatar}
              alt={
                isBot
                  ? selectedBot?.name || `${capitalizedDifficulty} Bot`
                  : playerName
              }
              className="object-contain bg-gray-800 dark:bg-gray-700"
            />
            <AvatarFallback>
              {isBot
                ? difficulty.substring(0, 2).toUpperCase()
                : playerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium leading-none">
                {isBot
                  ? selectedBot?.name || `${capitalizedDifficulty} Bot`
                  : playerName}
              </span>
              {isBot && selectedBot ? (
                <Image
                  src={selectedBot.flag}
                  alt={`${selectedBot.name} flag`}
                  className="w-5 h-3"
                  width={20}
                  height={12}
                />
              ) : countryFlag ? (
                <Image
                  src={`/flags/${countryFlag}.png`}
                  alt={`${countryFlag} flag`}
                  className="w-5 h-3"
                  width={20}
                  height={12}
                />
              ) : null}
              {flair && !isBot && (
                <span className="text-sm" role="img" aria-label="Player Flair">
                  {flair}
                </span>
              )}
            </div>
            <CardDescription className="text-[11px]">
              Rating: {isBot && selectedBot ? selectedBot.rating : rating}
            </CardDescription>
          </div>
        </CardHeader>
        {hasCapturedPieces && (
          <CardContent className="p-2 pt-0">
            <CapturedPieces
              capturedPieces={capturedPieces}
              playerColor={profileColor}
              pieceSet={currentPieceSet}
              className="mt-1"
            />
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
