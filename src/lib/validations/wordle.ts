import * as z from "zod";

export const RecordWordleAttemptSchema = z.object({
  targetWord: z.string().length(5, "Target word must be 5 characters long"),
  guessesTaken: z
    .number()
    .min(1)
    .max(6, "Guesses taken must be between 1 and 6"),
  isWin: z.boolean(),
});

export type RecordWordleAttemptPayload = z.infer<
  typeof RecordWordleAttemptSchema
>;
