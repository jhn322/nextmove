import { useDrop, DropTargetMonitor } from "react-dnd";
import { ReactNode, useRef } from "react";
import Square from "./Square";

interface DroppableSquareProps {
  row: number;
  col: number;
  isLight: boolean;
  isSelected: boolean;
  isCheck: boolean;
  isLastMove: boolean;
  isPossibleMove: boolean;
  isHintMove?: boolean;
  isRedHighlighted?: boolean;
  isPreMadeMove?: boolean;
  isPreMadePossibleMove?: boolean;
  difficulty: string;
  coordinate?: string;
  showRank?: boolean;
  showFile?: boolean;
  children?: ReactNode;
  onDrop: (
    item: { type: string; position: string },
    targetPosition: string
  ) => void;
  onClick: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

interface DropItem {
  type: string;
  position: string;
}

const DroppableSquare = ({
  row,
  col,
  isLight,
  isSelected,
  isCheck,
  isLastMove,
  isPossibleMove,
  isHintMove = false,
  isRedHighlighted = false,
  isPreMadeMove = false,
  isPreMadePossibleMove = false,
  difficulty,
  coordinate,
  showRank,
  showFile,
  children,
  onDrop,
  onClick,
  onContextMenu,
}: DroppableSquareProps) => {
  const position = `${"abcdefgh"[col]}${8 - row}`;
  const elementRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, dropRef] = useDrop<
    DropItem,
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "CHESS_PIECE",
    drop: (item) => {
      onDrop(item, position);
      return undefined;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect the drop ref to our element ref
  dropRef(elementRef);

  return (
    <div ref={elementRef} className="w-full h-full">
      <Square
        isLight={isLight}
        isSelected={isSelected}
        isCheck={isCheck}
        isLastMove={isLastMove || (isOver && canDrop)}
        isPossibleMove={isPossibleMove}
        isHintMove={isHintMove}
        isRedHighlighted={isRedHighlighted || (isOver && !canDrop)}
        isPreMadeMove={isPreMadeMove}
        isPreMadePossibleMove={isPreMadePossibleMove}
        difficulty={difficulty}
        coordinate={coordinate}
        showRank={showRank}
        showFile={showFile}
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        {children}
      </Square>
    </div>
  );
};

export default DroppableSquare;
