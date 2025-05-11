import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema } from "./common";
import { AUTH_MESSAGES } from "@/lib/auth/constants/auth";

/**
 * Validation schema for the registration form (used on the client)
 */
export const registerFormSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.ERROR_PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

/**
 * Validation schema for the registration API (used on the server)
 */
export const registerApiSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
