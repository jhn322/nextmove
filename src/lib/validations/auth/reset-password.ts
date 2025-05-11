import * as z from "zod";
import { passwordSchema } from "./common";

export const resetPasswordSchema = z
  .object({
    password: passwordSchema, // Use the common password schema
    confirmPassword: z.string(), // Basic string for confirmation
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Attach error to the confirmation field
  });
