import { z } from 'zod';

/**
 * Gemensamma valideringsregler för autentisering
 */

// Email validering
export const emailSchema = z
  .string()
  .min(1, { message: 'Email är obligatoriskt' })
  .email({ message: 'Ogiltig email-format' });

// Lösenord validering
export const passwordSchema = z
  .string()
  .min(8, { message: 'Lösenordet måste vara minst 8 tecken' })
  .max(100, { message: 'Lösenordet får inte överstiga 100 tecken' })
  .regex(/[A-Z]/, { message: 'Lösenordet måste innehålla minst en stor bokstav' })
  .regex(/[a-z]/, { message: 'Lösenordet måste innehålla minst en liten bokstav' })
  .regex(/[0-9]/, { message: 'Lösenordet måste innehålla minst en siffra' });

// Namn validering
export const nameSchema = z
  .string()
  .min(2, { message: 'Namnet måste vara minst 2 tecken' })
  .max(50, { message: 'Namnet får inte överstiga 50 tecken' });