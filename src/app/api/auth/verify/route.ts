import { NextResponse, type NextRequest } from "next/server";
import db from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    // Redirect to an error page or show message
    return NextResponse.redirect(
      new URL("/auth/invalid-token?reason=missing", req.url)
    );
  }

  try {
    // 1. Find potential matching tokens (non-expired)
    // We hash the incoming token and compare it to stored hashes.
    const potentialTokens = await db.emailVerificationToken.findMany({
      where: {
        expires: { gt: new Date() },
      },
      include: { user: true }, // Include user data for updating
    });

    let validTokenRecord = null;
    for (const record of potentialTokens) {
      const isTokenMatch = await bcrypt.compare(token, record.token);
      if (isTokenMatch) {
        validTokenRecord = record;
        break;
      }
    }

    // 2. Check if a valid, non-expired token was found
    if (!validTokenRecord) {
      // Redirect to an error page or show message
      return NextResponse.redirect(
        new URL("/auth/invalid-token?reason=not_found_or_expired", req.url)
      );
    }

    // 3. Update the user's emailVerified status and delete the token
    await db.$transaction([
      db.user.update({
        where: { id: validTokenRecord.userId },
        data: { emailVerified: new Date() }, // Set to current time
      }),
      db.emailVerificationToken.delete({
        where: { id: validTokenRecord.id },
      }),
    ]);

    // 4. Redirect to a success page or login page
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("verified", "true"); // Add a query param to show a success message on login page
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("[EMAIL_VERIFY_GET]", error);
    // Redirect to a generic error page
    return NextResponse.redirect(
      new URL("/auth/invalid-token?reason=server_error", req.url)
    );
  }
}
