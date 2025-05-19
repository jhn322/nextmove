import { useState } from "react";
import Piece from "./Piece";
import { X } from "lucide-react";

interface PawnPromotionModalProps {
  color: "w" | "b";
  pieceSet: string;
  onSelect: (pieceType: "q" | "r" | "n" | "b") => void;
  onCancel: () => void;
}

const PawnPromotionModal = ({
  color,
  pieceSet,
  onSelect,
  onCancel,
}: PawnPromotionModalProps) => {
  const [hoveredPiece, setHoveredPiece] = useState<string | null>(null);

  // Piece options for promotion
  const promotionPieces: { type: "q" | "r" | "n" | "b"; label: string }[] = [
    { type: "q", label: "Queen" },
    { type: "r", label: "Rook" },
    { type: "n", label: "Knight" },
    { type: "b", label: "Bishop" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg p-4 flex flex-col items-center max-w-[90vw] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Promote Pawn</h3>
        <div className="grid grid-cols-2 gap-3">
          {promotionPieces.map((piece) => (
            <button
              key={piece.type}
              className={`
                relative p-3 rounded-lg transition-all duration-200
                ${
                  hoveredPiece === piece.type
                    ? "bg-accent/20"
                    : "hover:bg-accent/10"
                }
                flex flex-col items-center justify-center
              `}
              onClick={() => onSelect(piece.type)}
              onMouseEnter={() => setHoveredPiece(piece.type)}
              onMouseLeave={() => setHoveredPiece(null)}
              aria-label={`Promote to ${piece.label}`}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                <Piece
                  type={
                    color === "w"
                      ? piece.type.toUpperCase()
                      : piece.type.toLowerCase()
                  }
                  pieceSet={pieceSet}
                />
              </div>
              <span className="text-sm mt-2 font-medium">{piece.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="mt-5 px-5 py-2.5 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <X size={16} />
          <span>Cancel Selection</span>
        </button>
      </div>
    </div>
  );
};

export default PawnPromotionModal;
