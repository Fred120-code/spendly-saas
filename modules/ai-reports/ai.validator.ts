import { z } from "zod";
import { parseOrThrow } from "@/lib/validation/parse";

export const chatQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question manquante")
    .max(500, "La question ne doit pas dépasser 500 caractères"),
});

export type ChatQuestionInput = z.infer<typeof chatQuestionSchema>;

export class AiValidator {
  static validateQuestion(data: unknown): ChatQuestionInput {
    return parseOrThrow(chatQuestionSchema, data);
  }
}
