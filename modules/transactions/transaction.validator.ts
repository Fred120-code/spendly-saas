export interface TransactionInput {
  budgetId: string;
  amount: number;
  description: string;
}

export class TransactionValidator {
  static validateCreateInput(data: Partial<TransactionInput>): void {
    if (!data.budgetId || data.budgetId.trim().length === 0) {
      throw new Error("L'ID du budget est obligatoire");
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error("Le montant doit être supérieur à 0");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error("La description est obligatoire");
    }

    if (data.description.length > 255) {
      throw new Error("La description ne doit pas dépasser 255 caractères");
    }
  }
}
