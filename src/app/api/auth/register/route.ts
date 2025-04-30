import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { USER_ROLES, AUTH_MESSAGES } from '@/lib/auth/constants/auth';
import { registerApiSchema } from '@/lib/validations/auth/register'; // Importera nya schemat
import { ZodIssue } from 'zod'; // Importera ZodIssue
// import { createVerificationToken } from '@/lib/auth/utils/token';
// import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();


    //* Validera input med det nya API-schemat
    const validationResult = registerApiSchema.safeParse(body); // Använd nya schemat

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e: ZodIssue) => e.message); // Använd ZodIssue typen
      return NextResponse.json(
        // Använd specifikt fel eller standard om join är tom
        { message: errors.join(', ') || AUTH_MESSAGES.ERROR_MISSING_FIELDS },
        { status: 400 }
      );
    }

    // Nu innehåller validationResult.data bara name, email, password
    const { name, email, password } = validationResult.data;

    //* Kolla om användaren redan finns, inkludera konton
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }, // Inkludera länkade konton
    });

    if (existingUser) {
      //* Kolla om det finns några länkade OAuth-konton
      if (existingUser.accounts && existingUser.accounts.length > 0) {
        // Användaren finns och har loggat in via OAuth tidigare
        return NextResponse.json(
          { message: AUTH_MESSAGES.ERROR_EMAIL_EXISTS_OAUTH }, // Ge specifikt felmeddelande
          { status: 409 } // Använd 409 Conflict
        );
      } else {
        // Användaren finns men har inga OAuth-konton (troligen skapad med credentials)
        return NextResponse.json(
          { message: AUTH_MESSAGES.ERROR_EMAIL_EXISTS },
          { status: 409 } // Använd 409 Conflict
        );
      }
    }

    //* Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 12);

    //* Skapa användaren (om ingen fanns)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: USER_ROLES.USER, // Använd konstant
        // Observera att emailVerified är null eftersom användaren måste verifiera sin e-post
      },
    });

    // Ta bort alla befintliga tokens för denna e-post (för säkerhets skull)
    // await prisma.verificationToken.deleteMany({
    //   where: {
    //     identifier: email,
    //   },
    // });

    //* Generera verifieringstoken och skicka e-post
    // let verificationToken = null;
    // try {
    //   // Skapa en verifieringstoken
    //   console.log(`Skapar verifieringstoken för ${email}...`);
    //   verificationToken = await createVerificationToken(email);
    //   console.log(`Token skapad: ${verificationToken.substring(0, 10)}...`);

    //   // Dubbelkolla att token verkligen har skapats i databasen
    //   const tokenInDb = await prisma.verificationToken.findFirst({
    //     where: {
    //       identifier: email,
    //       token: verificationToken
    //     }
    //   });

    //   if (!tokenInDb) {
    //     console.error(`VARNING: Token kunde inte verifieras i databasen för ${email}`);
    //   } else {
    //     console.log(`Token verifierad i databasen för ${email}`);
    //   }

    //   // Skicka verifieringsmail
    //   console.log(`Skickar verifieringsmail till ${email} med token ${verificationToken.substring(0, 10)}...`);
    //   const emailResult = await sendVerificationEmail(
    //     email,
    //     verificationToken,
    //     name
    //   );

    //   if (!emailResult.success) {
    //     console.error('Failed to send verification email:', emailResult.error);
    //     // Fortsätt ändå, användaren kan begära en ny verifieringslänk senare
    //   } else {
    //     console.log(`Verifieringsmail skickat till ${email} med token ${verificationToken.substring(0, 10)}...`);
    //   }
    // } catch (emailError) {
    //   console.error('Error in verification process:', emailError);
    //   // Vi fortsätter ändå, användaren kan begära en ny verifieringslänk senare
    // }

    // Ta bort lösenordet från svaret
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: AUTH_MESSAGES.SUCCESS_REGISTRATION,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registreringsfel:', error);
    // Använd mer generellt registreringsfel här
    return NextResponse.json(
      { message: AUTH_MESSAGES.ERROR_REGISTRATION_FAILED },
      { status: 500 }
    );
  }
} 