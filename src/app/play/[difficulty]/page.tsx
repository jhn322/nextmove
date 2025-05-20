import { Metadata } from "next";
import ChessGame from "@/app/play/[difficulty]/ChessGame";

export const metadata: Metadata = {
  title: "Play Chess | NextMove",
};

export default function Page() {
  return <ChessGame />;
}
