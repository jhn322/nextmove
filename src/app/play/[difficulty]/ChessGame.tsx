"use client";

import { useParams } from "next/navigation";
import ChessBoard from "@/components/ChessBoard";

export default function ChessGame() {
  const params = useParams();
  const difficulty = params.difficulty as string;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <h1 className="text-2xl font-bold mb-8">
        Playing against {difficulty} bot
      </h1>
      <ChessBoard difficulty={difficulty} />
    </div>
  );
}
