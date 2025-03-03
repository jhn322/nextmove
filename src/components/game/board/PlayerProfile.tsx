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
  rating = 1500,
  capturedPieces = [],
  selectedBot,
  lastMove,
  game,
  playerColor = "w",
  pieceSet: initialPieceSet = "staunty",
}: PlayerProfileProps) => {
  const { session, status, supabaseClient } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [playerAvatar, setPlayerAvatar] = useState<string>("");
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

  // Load player data from Supabase and fallback to localStorage
  useEffect(() => {
    if (!isBot) {
      async function loadUserSettings() {
        // First try to load from Supabase if authenticated
        if (status === "authenticated" && session?.user?.id) {
          try {
            // Use the client from auth context
            const { data, error } = await supabaseClient
              .from("user_settings")
              .select("display_name, avatar_url, piece_set")
              .filter("user_id", "eq", session.user.id)
              .maybeSingle();

            if (error && error.code !== "PGRST116") {
              console.error("Error fetching settings:", error);
            } else if (data) {
              setPlayerName(data.display_name);
              setPlayerAvatar(data.avatar_url);

              // Update piece set if provided in user settings
              if (data.piece_set) {
                setCurrentPieceSet(data.piece_set);
              }

              // Also update localStorage for offline use
              localStorage.setItem("chess-player-name", data.display_name);
              localStorage.setItem("chess-player-avatar", data.avatar_url);
              if (data.piece_set) {
                localStorage.setItem("chess-piece-set", data.piece_set);
              }

              return; // Exit early if we loaded from Supabase
            }
          } catch (error) {
            console.error("Unexpected error loading user settings:", error);
          }
        }

        // Fallback to localStorage if Supabase failed or user is not authenticated
        if (typeof window !== "undefined") {
          const savedPlayerName = localStorage.getItem("chess-player-name");
          const savedAvatarUrl = localStorage.getItem("chess-player-avatar");
          const savedPieceSet = localStorage.getItem("chess-piece-set");

          if (savedPlayerName) {
            setPlayerName(savedPlayerName);
          }

          if (savedAvatarUrl) {
            setPlayerAvatar(savedAvatarUrl);
          }

          if (savedPieceSet) {
            setCurrentPieceSet(savedPieceSet);
          }
        }
      }

      loadUserSettings();
    }
  }, [isBot, session, status, supabaseClient]);

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
