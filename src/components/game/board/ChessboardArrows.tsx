// * ============================================================================
// *                              CHESSBOARD ARROWS
// * ============================================================================

import React from "react";

// ** Local type for Arrow (from chessboard-arrows) ** //
export interface Arrow {
  from: string;
  to: string;
  color?: string;
}

// ** Types ** //
interface ChessboardArrowsProps {
  arrows: Arrow[];
  boardSize: number;
  squareSize: number;
  whitePiecesBottom: boolean;
}

const ARROW_COLOR = "rgba(255,170,0,0.7)";

// Returns the center of a square in SVG coordinates, respecting board orientation
const getSquareCoords = (
  square: string,
  squareSize: number,
  whitePiecesBottom: boolean
): { x: number; y: number } => {
  const fileChar = square.charCodeAt(0);
  const rankNum = parseInt(square[1], 10);

  if (whitePiecesBottom) {
    // Files a-h map to 0-7, Ranks 8-1 map to 0-7 (rank 8 is idx 0, rank 1 is idx 7)
    const fileIdx = fileChar - "a".charCodeAt(0);
    const rankIdx = 8 - rankNum;
    return {
      x: (fileIdx + 0.5) * squareSize,
      y: (rankIdx + 0.5) * squareSize,
    };
  } else {
    // Board is flipped for black.
    // Files h-a map to 0-7 (h is idx 0, a is idx 7)
    // Ranks 1-8 map to 0-7 (rank 1 is idx 0, rank 8 is idx 7)
    const fileIdx = "h".charCodeAt(0) - fileChar;
    const rankIdx = rankNum - 1;
    return {
      x: (fileIdx + 0.5) * squareSize,
      y: (rankIdx + 0.5) * squareSize,
    };
  }
};

// Returns the L-corner for a 90-degree arrow if applicable
const getLShapeCorner = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } | null => {
  // L-shape means not straight and not diagonal
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  if (dx === 0 || dy === 0 || dx === dy) return null; // Straight or diagonal, not L

  // Prefer to make the first segment along the longer delta if dx and dy are different
  // This makes knight moves look more natural (e.g., 2 squares then 1 square)
  if (dx > dy) {
    return { x: to.x, y: from.y }; // Horizontal first, then vertical
  } else {
    return { x: from.x, y: to.y }; // Vertical first, then horizontal
  }
};

// Calculates the angle in radians between two points
const getAngle = (
  from: { x: number; y: number },
  to: { x: number; y: number }
) => Math.atan2(to.y - from.y, to.x - from.x);

// Generates SVG points for a triangular arrowhead.
// Tip is at (ARROW_HEAD_SIZE, 0) in its local space before rotation if base is at (0,0).
// We draw it so its base is at (0,0) and tip extends forward.
const getArrowHeadPoints = (headSize: number) => {
  const width = headSize * 1.4;
  const length = headSize;
  // Tip at (length, 0), base at (0, -width/2) and (0, width/2)
  return `${length},0 0,-${width / 2} 0,${width / 2}`;
};

// ** Main Component ** //
const ChessboardArrows: React.FC<ChessboardArrowsProps> = ({
  arrows,
  boardSize,
  squareSize,
  whitePiecesBottom,
}) => {
  // Calculate dynamic arrow dimensions based on squareSize
  const dynamicArrowShaftWidth = squareSize * 0.2; // Arrow shaft width as a percentage of square size
  const dynamicArrowHeadLength = squareSize * 0.45; // Arrowhead length as a percentage of square size
  // Offset for the arrowhead base from the true destination, along the arrow angle
  const dynamicArrowHeadBaseOffset = dynamicArrowHeadLength * 0.3; // Adjust for visual fit

  return (
    <svg
      width={boardSize}
      height={boardSize}
      className="absolute top-0 left-0 pointer-events-none z-20"
      aria-label="Chessboard arrows overlay"
      tabIndex={-1}
    >
      {arrows.map((arrow, idx) => {
        const from = getSquareCoords(arrow.from, squareSize, whitePiecesBottom);
        const to = getSquareCoords(arrow.to, squareSize, whitePiecesBottom); // True destination center
        const color = arrow.color || ARROW_COLOR;

        let shaftTargetX: number;
        let shaftTargetY: number;
        let arrowAngle: number;
        let shaftPointsDef: { x: number; y: number }[];

        const corner = getLShapeCorner(from, to);

        if (corner) {
          // L-shaped arrow
          arrowAngle = getAngle(corner, to);
          // Shorten the last segment for the arrowhead base
          shaftTargetX =
            to.x - Math.cos(arrowAngle) * dynamicArrowHeadBaseOffset;
          shaftTargetY =
            to.y - Math.sin(arrowAngle) * dynamicArrowHeadBaseOffset;
          shaftPointsDef = [from, corner, { x: shaftTargetX, y: shaftTargetY }];
        } else {
          // Straight or diagonal arrow
          arrowAngle = getAngle(from, to);
          // Shorten the shaft for the arrowhead base
          shaftTargetX =
            to.x - Math.cos(arrowAngle) * dynamicArrowHeadBaseOffset;
          shaftTargetY =
            to.y - Math.sin(arrowAngle) * dynamicArrowHeadBaseOffset;
          shaftPointsDef = [from, { x: shaftTargetX, y: shaftTargetY }];
        }

        const pointsStr = shaftPointsDef.map((p) => `${p.x},${p.y}`).join(" ");

        return (
          <g key={idx}>
            {/* Arrow Shaft */}
            <polyline
              points={pointsStr}
              fill="none"
              stroke={color}
              strokeWidth={dynamicArrowShaftWidth}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              opacity={0.85}
            />
            {/* Arrowhead: Base is at shaftTarget, tip extends to 'to' */}
            <g
              transform={`translate(${shaftTargetX},${shaftTargetY}) rotate(${
                (arrowAngle * 180) / Math.PI
              })`}
            >
              <polygon
                points={getArrowHeadPoints(dynamicArrowHeadLength)}
                fill={color}
                opacity={0.85}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export default ChessboardArrows;
