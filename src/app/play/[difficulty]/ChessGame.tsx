"use client";

import { useParams } from "next/navigation";
import ChessBoard from "@/components/game/board/ChessBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function ChessGame() {
  const params = useParams();
  const difficulty = params.difficulty as string;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4 min-h-[calc(100vh-4rem)]">
      <DndProvider backend={HTML5Backend}>
        <ChessBoard difficulty={difficulty} />
      </DndProvider>
    </div>
  );
}
