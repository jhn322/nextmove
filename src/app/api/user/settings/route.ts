import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the expected schema for the request body
const updateSettingsSchema = z
  .object({
    name: z.string().min(1).max(50).optional(), // Validate name
    image: z.string().optional(), // Validate image path/URL
    // Add other settings fields here if needed in the future
    // e.g., countryFlag: z.string().optional(), flair: z.string().optional()
  })
  .strict(); // Ensure no extra fields are passed

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

    // Ensure at least one valid field is provided
    if (Object.keys(validationResult.data).length === 0) {
      return NextResponse.json(
        { message: "No settings provided to update" },
        { status: 400 }
      );
    }

    // Update user settings in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validationResult.data.name, // Update name if provided
        image: validationResult.data.image, // Update image if provided
        // Add other fields here:
        // countryFlag: validationResult.data.countryFlag,
        // flair: validationResult.data.flair,
      },
      select: { id: true, name: true, image: true }, // Select only necessary fields for response
    });

    return NextResponse.json(
      { message: "Settings updated successfully", user: updatedUser },
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
