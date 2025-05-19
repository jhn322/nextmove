import { ChessWordleClient } from "@/components/chess-wordle/chess-wordle-client";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { Metadata } from "next";

// ** Page Metadata ** //
export const metadata: Metadata = {
  title: "Chess Wordle | NextMove",
  description: "Test your chess vocabulary with a fun Wordle-style puzzle.",
};

// * Loading Component for Suspense Fallback * //
const ChessWordleLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
      <p className="text-xl text-muted-foreground">Loading Chess Wordle...</p>
    </div>
  );
};

export default async function ChessWordlePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/play/chess-wordle");
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <Suspense fallback={<ChessWordleLoading />}>
        <ChessWordleClient />
      </Suspense>
    </div>
  );
}
