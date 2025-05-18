import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the expected schema for the request body
const updateSettingsSchema = z
  .object({
    // Profile fields
    name: z.string().min(1).max(50).optional(),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    location: z.string().max(100).optional(),
    image: z.string().optional(),
    countryFlag: z.string().optional(),
    flair: z.string().optional(),
    timezone: z.string().optional(),
    clockFormat: z.enum(["12", "24"]).optional(),

    // Game settings fields
    preferredDifficulty: z.string().optional(),
    soundEnabled: z.boolean().optional(),
    pieceSet: z.string().optional(),
    whitePiecesBottom: z.boolean().optional(),
    showCoordinates: z.boolean().optional(),
    enableAnimations: z.boolean().optional(),
    enableConfetti: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    autoQueen: z.boolean().optional(),
    moveInputMethod: z.enum(["click", "drag", "both"]).optional(),
    boardTheme: z.string().optional(),
  })
  .strict();

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate the request body
    const validationResult = updateSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const dataToUpdate = validationResult.data;

    // Ensure at least one valid field is provided
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No settings provided to update" },
        { status: 400 }
      );
    }

    // Prepare data for Prisma update
    const prismaData: Partial<
      Parameters<typeof prisma.user.update>[0]["data"]
    > = {};
    if (dataToUpdate.name !== undefined) prismaData.name = dataToUpdate.name;
    if (dataToUpdate.firstName !== undefined)
      prismaData.firstName = dataToUpdate.firstName;
    if (dataToUpdate.lastName !== undefined)
      prismaData.lastName = dataToUpdate.lastName;
    if (dataToUpdate.location !== undefined)
      prismaData.location = dataToUpdate.location;
    if (dataToUpdate.image !== undefined) prismaData.image = dataToUpdate.image;
    if (dataToUpdate.countryFlag !== undefined)
      prismaData.countryFlag = dataToUpdate.countryFlag;
    if (dataToUpdate.flair !== undefined) prismaData.flair = dataToUpdate.flair;
    if (dataToUpdate.timezone !== undefined)
      prismaData.timezone = dataToUpdate.timezone;
    if (dataToUpdate.clockFormat !== undefined)
      prismaData.clockFormat = dataToUpdate.clockFormat;
    if (dataToUpdate.preferredDifficulty !== undefined)
      prismaData.preferredDifficulty = dataToUpdate.preferredDifficulty;
    if (dataToUpdate.soundEnabled !== undefined)
      prismaData.soundEnabled = dataToUpdate.soundEnabled;
    if (dataToUpdate.pieceSet !== undefined)
      prismaData.pieceSet = dataToUpdate.pieceSet;
    if (dataToUpdate.whitePiecesBottom !== undefined)
      prismaData.whitePiecesBottom = dataToUpdate.whitePiecesBottom;
    if (dataToUpdate.showCoordinates !== undefined)
      prismaData.showCoordinates = dataToUpdate.showCoordinates;
    if (dataToUpdate.enableAnimations !== undefined)
      prismaData.enableAnimations = dataToUpdate.enableAnimations;
    if (dataToUpdate.enableConfetti !== undefined)
      prismaData.enableConfetti = dataToUpdate.enableConfetti;
    if (dataToUpdate.highContrast !== undefined)
      prismaData.highContrast = dataToUpdate.highContrast;
    if (dataToUpdate.autoQueen !== undefined)
      prismaData.autoQueen = dataToUpdate.autoQueen;
    if (dataToUpdate.moveInputMethod !== undefined)
      prismaData.moveInputMethod = dataToUpdate.moveInputMethod;
    if (dataToUpdate.boardTheme !== undefined)
      prismaData.boardTheme = dataToUpdate.boardTheme;

    // Update user settings in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: prismaData,
    });

    return NextResponse.json(
      { message: "Settings updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
