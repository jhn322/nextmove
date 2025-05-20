import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AnimatedPieceProps {
  type: string;
  color: "w" | "b";
  pieceSet: string;
  from: string;
  to: string;
  squareSize: number;
  onAnimationEnd?: () => void;
  className?: string;
}

// Helper to convert square (e.g. "e2") to [col, row] (0-indexed)
const getCoords = (square: string): [number, number] => {
  const file = square[0];
  const rank = square[1];
  const col = "abcdefgh".indexOf(file);
  const row = 8 - parseInt(rank);
  return [col, row];
};

const AnimatedPiece = ({
  type,
  color,
  pieceSet,
  from,
  to,
  squareSize,
  onAnimationEnd,
  className,
}: AnimatedPieceProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pieceRef = useRef<HTMLDivElement>(null);

  // Calculate start and end positions
  const [fromCol, fromRow] = getCoords(from);
  const [toCol, toRow] = getCoords(to);

  // Start at the from square
  const [pos, setPos] = useState({
    left: fromCol * squareSize,
    top: fromRow * squareSize,
  });

  // Get the correct SVG path based on piece type, color, and set
  const getPieceSVG = (type: string, color: "w" | "b") => {
    return `/pieces/${pieceSet}/${color}${type.toLowerCase()}.svg`;
  };

  useEffect(() => {
    // Start animation on mount
    setIsAnimating(true);
    // Animate to the destination
    setTimeout(() => {
      setPos({
        left: toCol * squareSize,
        top: toRow * squareSize,
      });
    }, 10);
  }, [fromCol, fromRow, toCol, toRow, squareSize]);

  // Listen for transition end
  useEffect(() => {
    if (!pieceRef.current) return;
    const handleTransitionEnd = () => {
      if (onAnimationEnd) onAnimationEnd();
    };
    const node = pieceRef.current;
    node.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      node.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [onAnimationEnd]);

  return (
    <div
      ref={pieceRef}
      className={cn(
        "absolute z-50 pointer-events-none",
        isAnimating && "transition-all duration-150 ease-in-out",
        className
      )}
      style={{
        width: squareSize,
        height: squareSize,
        left: pos.left,
        top: pos.top,
      }}
      aria-label="Animated chess piece"
    >
      <Image
        src={getPieceSVG(type, color)}
        alt={`${color === "w" ? type.toUpperCase() : type.toLowerCase()} chess piece`}
        width={squareSize}
        height={squareSize}
        className="w-full h-full object-contain"
        priority
        draggable={false}
      />
    </div>
  );
};

export default AnimatedPiece;
