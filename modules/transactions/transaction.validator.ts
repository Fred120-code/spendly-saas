import { z } from "zod";
import { parseOrThrow } from "@/lib/validation/parse";

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "La description est obligatoire")
  .max(255, "La description ne doit pas dépasser 255 caractères");

const amountSchema = z
  .number()
  .positive("Le montant doit être supérieur à 0");

export const transactionCreateSchema = z.object({
  budgetId: z
    .string()
    .trim()
    .min(1, "L'ID du budget est obligatoire"),
  amount: amountSchema,
  description: descriptionSchema,
});

export const transactionUpdateSchema = z.object({
  amount: amountSchema,
  description: descriptionSchema,
});

export type TransactionInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;

export class TransactionValidator {
  static validateCreateInput(data: unknown): TransactionInput {
    return parseOrThrow(transactionCreateSchema, data);
  }

  static validateUpdateInput(data: unknown): TransactionUpdateInput {
    return parseOrThrow(transactionUpdateSchema, data);
  }
}
