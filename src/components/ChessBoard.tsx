import { useState } from "react";
import Square from "@/components/Square";
import Piece from "@/components/Piece";

const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

const ChessBoard = ({ difficulty }: { difficulty: string }) => {
  const [board, setBoard] = useState<(string | null)[][]>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    if (!selectedPiece) {
      // If no piece is selected and the clicked square has a piece, select it
      if (board[row][col]) {
        setSelectedPiece({ row, col });
      }
    } else {
      // If a piece is selected, try to move it
      const newBoard = [...board.map((row) => [...row])];
      newBoard[row][col] = board[selectedPiece.row][selectedPiece.col];
      newBoard[selectedPiece.row][selectedPiece.col] = null;
      setBoard(newBoard);
      setSelectedPiece(null);
    }
  };

  return (
    <div className="w-full max-w-[min(100vw,80vh)] aspect-square">
      <div className="w-full h-full grid grid-cols-8 border border-border">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              isLight={(rowIndex + colIndex) % 2 === 0}
              isSelected={
                selectedPiece?.row === rowIndex &&
                selectedPiece?.col === colIndex
              }
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              difficulty={difficulty}
            >
              {piece && <Piece type={piece} />}
            </Square>
          ))
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
