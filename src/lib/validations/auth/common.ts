import { z } from "zod";

/**
 * Common validation rules for authentication
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email format" });

// Password validation
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password cannot exceed 100 characters" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

// Name validation (If you need this translated as well)
export const nameSchema = z
  .string()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(50, { message: "Name cannot exceed 50 characters" });
