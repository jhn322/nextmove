import { z } from "zod";
import { emailSchema } from "./common";
import { AUTH_MESSAGES } from "@/lib/auth/constants/auth";

/**
 * Validation schema for login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, { message: AUTH_MESSAGES.ERROR_PASSWORD_REQUIRED }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
