import type { ZodType } from "zod";
import { ValidationError } from "@/lib/errors/app-error";

/**
 * Parse des données avec Zod et lève une ValidationError métier
 * (message sûr pour le client) en cas d'échec.
 */
export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const firstIssue = result.error.issues[0];
  throw new ValidationError(firstIssue?.message ?? "Données invalides");
}
