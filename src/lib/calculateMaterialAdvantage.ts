// Piece values in chess (standard values)
export const PIECE_VALUES = {
  p: 1, // pawn
  n: 3, // knight
  b: 3, // bishop
  r: 5, // rook
  q: 9, // queen
  k: 0, // king (not typically assigned a value for material advantage)
};

export interface CapturedPiece {
  type: string;
  color: "w" | "b";
}

/**
 * Calculates the material advantage based on captured pieces
 * @param capturedPieces Array of captured pieces
 * @returns The material advantage (positive means white advantage, negative means black advantage)
 */
export const calculateMaterialAdvantage = (
  capturedPieces: CapturedPiece[]
): number => {
  let advantage = 0;

  capturedPieces.forEach((piece) => {
    const pieceType = piece.type.toLowerCase();
    const pieceValue =
      PIECE_VALUES[pieceType as keyof typeof PIECE_VALUES] || 0;

    // If black piece is captured, white gains advantage
    if (piece.color === "b") {
      advantage += pieceValue;
    }
    // If white piece is captured, black gains advantage
    else {
      advantage -= pieceValue;
    }
  });

  return advantage;
};

/**
 * Groups captured pieces by type for display
 * @param capturedPieces Array of captured pieces
 * @returns Object with counts of each piece type
 */
export const groupCapturedPieces = (
  capturedPieces: CapturedPiece[]
): Record<string, number> => {
  const groupedPieces: Record<string, number> = {};

  capturedPieces.forEach((piece) => {
    const pieceKey = piece.type;
    groupedPieces[pieceKey] = (groupedPieces[pieceKey] || 0) + 1;
  });

  return groupedPieces;
};
