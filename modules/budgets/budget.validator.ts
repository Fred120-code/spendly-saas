import { z } from "zod";
import { parseOrThrow } from "@/lib/validation/parse";

const emojiSchema = z
  .string()
  .min(1, "L'emoji est obligatoire")
  .refine((value) => /^[\p{Emoji}]/u.test(value), {
    message: "Le caractère fourni n'est pas un emoji valide",
  });

export const budgetCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom du budget est obligatoire")
    .max(100, "Le nom du budget ne doit pas dépasser 100 caractères"),
  amount: z
    .number()
    .positive("Le montant du budget doit être supérieur à 0"),
  emoji: emojiSchema,
});

export type BudgetInput = z.infer<typeof budgetCreateSchema>;

export class BudgetValidator {
  static validateCreateInput(data: unknown): BudgetInput {
    return parseOrThrow(budgetCreateSchema, data);
  }
}
