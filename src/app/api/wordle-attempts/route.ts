// * ==========================================================================
// *                            WORDLE ATTEMPTS API
// * ==========================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { RecordWordleAttemptSchema } from "@/lib/validations/wordle";

// **  POST - Record a new Wordle Attempt  ** //
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in to record attempts." },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const validationResult = RecordWordleAttemptSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { targetWord, guessesTaken, isWin } = validationResult.data;

    const newAttempt = await prisma.wordleAttempt.create({
      data: {
        userId: session.user.id,
        targetWord,
        guessesTaken,
        isWin,
      },
    });

    return NextResponse.json(
      { message: "Wordle attempt recorded successfully", data: newAttempt },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_WORDLE_ATTEMPTS_POST] Error:", error);
    // Differentiate between expected errors and unexpected ones if necessary
    if (error instanceof Error && error.message.includes("prisma")) {
      return NextResponse.json(
        { message: "Database error while recording attempt." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
