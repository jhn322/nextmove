import { Metadata } from "next";
import ChessGameWithBot from "@/app/play/[difficulty]/[botId]/ChessGameWithBot";

export const metadata: Metadata = {
  title: "Play vs Bot | NextMove",
};

export default function Page() {
  return <ChessGameWithBot />;
}
