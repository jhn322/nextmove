import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_MESSAGES } from '@/lib/auth/constants/auth';
import { checkVerificationToken } from '@/lib/auth/utils/token';


//* Verifierar en användares e-post med en token
// Route: POST /api/auth/verify
export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_MISSING_FIELDS },
        { status: 400 }
      );
    }

    // Validera token utan att radera den
    const isValid = await checkVerificationToken(token, email);

    if (!isValid) {
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_INVALID_TOKEN },
        { status: 400 }
      );
    }

    // Hitta användare med denna email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_DEFAULT },
        { status: 404 }
      );
    }

    // Kontrollera om användaren redan är verifierad
    if (user.emailVerified) {
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_ALREADY_VERIFIED },
        { status: 400 }
      );
    }

    // Uppdatera användare med verifierad e-post
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    // Nu när användaren är verifierad, rensa alla verifieringstokens för denna e-post
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json(
      { message: AUTH_MESSAGES.SUCCESS_VERIFICATION },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verifieringsfel:', error);
    return NextResponse.json(
      { message: AUTH_MESSAGES.ERROR_DEFAULT },
      { status: 500 }
    );
  }
}

//* Hanterar GET-förfrågningar för att verifiera e-post via URL-parametrar
// Route: GET /api/auth/verify
export async function GET(req: Request) {
  try {
    console.log('GET /api/auth/verify anrop mottaget');
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    console.log(`Verifiering för email: ${email || 'saknas'}, token: ${token ? token.substring(0, 10) + '...' : 'saknas'}`);

    if (!token || !email) {
      console.log('Saknade fält: token eller email');
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_MISSING_FIELDS },
        { status: 400 }
      );
    }

    // Validera token utan att radera den
    console.log('Försöker validera token...');
    const isValid = await checkVerificationToken(token, email);

    if (!isValid) {
      console.log('Token validering misslyckades');
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_INVALID_TOKEN },
        { status: 400 }
      );
    }

    // Hitta användare med denna email
    console.log(`Söker efter användare med email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Ingen användare hittades med email: ${email}`);
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_DEFAULT },
        { status: 404 }
      );
    }

    // Kontrollera om användaren redan är verifierad
    if (user.emailVerified) {
      console.log(`Användare ${email} är redan verifierad`);
      return NextResponse.json(
        { message: AUTH_MESSAGES.ERROR_ALREADY_VERIFIED },
        { status: 400 }
      );
    }

    // Uppdatera användare med verifierad e-post
    console.log(`Uppdaterar verifieringsstatus för användare: ${email}`);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    // Nu när användaren är verifierad, rensa alla verifieringstokens för denna e-post
    console.log(`Rensar alla verifieringstokens för ${email}`);
    const deleteResult = await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
    console.log(`${deleteResult.count} tokens raderade`);

    console.log(`Användare ${email} verifierad framgångsrikt`);
    return NextResponse.json(
      { message: AUTH_MESSAGES.SUCCESS_VERIFICATION },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verifieringsfel:', error);
    return NextResponse.json(
      { message: AUTH_MESSAGES.ERROR_DEFAULT },
      { status: 500 }
    );
  }
} 