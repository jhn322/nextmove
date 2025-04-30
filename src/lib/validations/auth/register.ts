import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './common';
import { AUTH_MESSAGES } from '@/lib/auth/constants/auth';

/**
 * Valideringsschema för registreringsformuläret (används på klienten)
 */
export const registerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: AUTH_MESSAGES.ERROR_PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  }
);

/**
 * Valideringsschema för registrerings-API:et (används på servern)
 */
export const registerApiSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;