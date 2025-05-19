import { Metadata } from "next";
import ChessGameWithBot from "@/app/play/[difficulty]/[botId]/ChessGameWithBot";

export const generateMetadata = ({
  params,
}: {
  params: { difficulty: string };
}): Metadata => {
  const difficulty =
    params.difficulty.charAt(0).toUpperCase() + params.difficulty.slice(1);

  return {
    title: `Play - ${difficulty} | NextMove`,
  };
};

export default function Page() {
  return <ChessGameWithBot />;
}
