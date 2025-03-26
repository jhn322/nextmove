import { useDrag, DragSourceMonitor } from "react-dnd";
import Piece from "./Piece";
import { useRef } from "react";

interface DraggablePieceProps {
  type: string;
  color: string;
  position: string;
  pieceSet?: string;
  canDrag: boolean;
  canBeTaken?: boolean;
  onDragStart?: (position: string) => void;
}

interface DragItem {
  type: string;
  position: string;
}

const DraggablePiece = ({
  type,
  color,
  position,
  pieceSet = "staunty",
  canDrag,
  canBeTaken = false,
  onDragStart,
}: DraggablePieceProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: "CHESS_PIECE",
    item: () => {
      // Call onDragStart when dragging begins
      if (onDragStart) {
        onDragStart(position);
      }
      return { type, position };
    },
    canDrag: () => canDrag,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Display the piece using appropriate case based on color
  const displayType = color === "w" ? type.toUpperCase() : type.toLowerCase();

  // Connect the drag ref to our element ref
  dragRef(elementRef);

  // Hide the piece in the original square when it's being dragged
  if (isDragging) {
    return (
      <div
        ref={elementRef}
        className="relative flex items-center justify-center invisible"
      />
    );
  }

  return (
    <div
      ref={elementRef}
      className="relative flex items-center justify-center"
      style={{
        cursor: canDrag ? "grab" : "default",
        transform: isDragging ? "scale(1.1)" : "scale(1)",
        transition: "transform 0.1s",
        zIndex: isDragging ? 100 : "auto",
      }}
    >
      <Piece type={displayType} pieceSet={pieceSet} canBeTaken={canBeTaken} />
    </div>
  );
};

export default DraggablePiece;
