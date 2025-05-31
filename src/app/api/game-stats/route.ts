import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { getUserGameStats } from "@/lib/game-service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const gameStats = await getUserGameStats(session.user.id);

    return NextResponse.json({ gameStats });
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch game stats" },
      { status: 500 }
    );
  }
}
