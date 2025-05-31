import React from "react";
import {
  CapturedPiece,
  PIECE_VALUES,
  calculateMaterialAdvantage,
  groupCapturedPieces,
} from "@/lib/calculateMaterialAdvantage";
import Piece from "./Piece";
import { cn } from "@/lib/utils";

interface CapturedPiecesProps {
  capturedPieces: CapturedPiece[];
  playerColor: "w" | "b";
  pieceSet: string;
  className?: string;
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  capturedPieces,
  playerColor,
  pieceSet,
  className,
}) => {
  // Filter pieces captured by the player (opposite color pieces)
  const filteredPieces = capturedPieces.filter(
    (piece) => piece.color !== playerColor
  );

  // Group pieces by type for display
  const groupedPieces = groupCapturedPieces(filteredPieces);

  // Calculate material advantage
  const materialAdvantage = calculateMaterialAdvantage(capturedPieces);

  // Determine if this player has an advantage
  const hasAdvantage =
    (playerColor === "w" && materialAdvantage > 0) ||
    (playerColor === "b" && materialAdvantage < 0);

  // Calculate the absolute advantage value for this player
  const advantageValue =
    playerColor === "w"
      ? Math.max(0, materialAdvantage)
      : Math.max(0, -materialAdvantage);

  // Sort pieces by value (highest to lowest)
  const sortedPieces = Object.entries(groupedPieces).sort((a, b) => {
    const valueA =
      PIECE_VALUES[a[0].toLowerCase() as keyof typeof PIECE_VALUES] || 0;
    const valueB =
      PIECE_VALUES[b[0].toLowerCase() as keyof typeof PIECE_VALUES] || 0;
    return valueB - valueA;
  });

  if (filteredPieces.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {sortedPieces.map(([pieceType, count]) => (
        <div key={pieceType} className="flex items-center">
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
            <Piece
              type={
                playerColor === "w"
                  ? pieceType.toLowerCase()
                  : pieceType.toUpperCase()
              }
              variant="symbol"
              pieceSet={pieceSet}
              forceColor="light"
              className={cn(
                "brightness-0 invert-[0.25] dark:brightness-0 dark:invert [.fantasy_&]:invert [.amethyst_&]:invert [.crimson_&]:invert [.jade_&]:invert [.amber_&]:invert [.rose_&]:invert [.cyberpunk_&]:invert [.dracula_&]:invert [.midnight_&]:invert",
                // Make pawn pieces smaller to match visual size of other pieces
                pieceType.toLowerCase() === "p" && "text-lg sm:text-xl"
              )}
            />
          </div>
          {count > 1 && (
            <span className="text-xs font-medium ml-0.5">×{count}</span>
          )}
        </div>
      ))}

      {advantageValue > 0 && (
        <div
          className={cn(
            "ml-1 text-xs font-semibold px-1.5 py-0.5 rounded-full",
            hasAdvantage
              ? "bg-green-500/20 text-green-600 dark:text-green-400"
              : "bg-red-500/20 text-red-600 dark:text-red-400"
          )}
        >
          +{advantageValue}
        </div>
      )}
    </div>
  );
};

export default CapturedPieces;
