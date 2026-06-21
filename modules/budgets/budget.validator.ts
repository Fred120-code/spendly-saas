export interface BudgetInput {
  name: string;
  amount: number;
  emoji: string;
}

export class BudgetValidator {
  static validateCreateInput(data: Partial<BudgetInput>): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Le nom du budget est obligatoire");
    }

    if (data.name.length > 100) {
      throw new Error("Le nom du budget ne doit pas dépasser 100 caractères");
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error("Le montant du budget doit être supérieur à 0");
    }

    if (!data.emoji) {
      throw new Error("L'emoji est obligatoire");
    }

    if (!/^[\p{Emoji}]/u.test(data.emoji)) {
      throw new Error("Le caractère fourni n'est pas un emoji valide");
    }
  }
}
