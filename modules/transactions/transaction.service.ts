import { transactionRepository, type ITransactionRepository } from "./transaction.repository";
import { TransactionValidator, type TransactionInput } from "./transaction.validator";
import { budgetService } from "@/modules/budgets/budget.service";
import { userService } from "@/modules/users/user.service";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors/app-error";

type PeriodKey = "last7" | "last30" | "last90" | "last365" | "all";

function periodToDateLimit(period: string): Date | null {
  const now = new Date();
  const dateLimit = new Date();
  switch (period) {
    case "last7":
      dateLimit.setDate(now.getDate() - 7);
      return dateLimit;
    case "last30":
      dateLimit.setDate(now.getDate() - 30);
      return dateLimit;
    case "last90":
      dateLimit.setDate(now.getDate() - 90);
      return dateLimit;
    case "last365":
      dateLimit.setFullYear(now.getFullYear() - 1);
      return dateLimit;
    case "all":
      return null;
    default:
      throw new ValidationError("Période invalide");
  }
}

export class TransactionService {
  constructor(private readonly repo: ITransactionRepository = transactionRepository) {}

  /**
   * Ajoute une transaction à un budget, en vérifiant via budgetService que
   * `userId` est bien le propriétaire de ce budget (corrige l'IDOR de
   * l'ancien addTansactionToBuget(budgetId, ...) qui ne vérifiait rien).
   */
  async addTransactionToOwnedBudget(userId: string, data: TransactionInput) {
    TransactionValidator.validateCreateInput(data);

    const budget = await budgetService.getOwnedBudgetById(userId, data.budgetId);

    const totalSpent = budget.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithTransaction = totalSpent + data.amount;
    if (totalWithTransaction > budget.amount) {
      throw new ValidationError(
        `Budget insuffisant. Montant disponible: ${budget.amount - totalSpent}€`,
      );
    }

    return this.repo.create({
      amount: data.amount,
      description: data.description,
      emoji: budget.emoji,
      budgetId: data.budgetId,
    });
  }

  async deleteOwnedTransaction(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.repo.findById(transactionId);
    if (!transaction) {
      throw new NotFoundError("Transaction introuvable");
    }
    if (!transaction.budgetId) {
      throw new ForbiddenError("Transaction orpheline, suppression refusée");
    }
    // Lève une ForbiddenError si l'utilisateur n'est pas propriétaire du budget parent.
    await budgetService.getOwnedBudgetById(userId, transaction.budgetId);
    await this.repo.delete(transactionId);
  }

  async getLastTransactionsForUser(userId: string, limit: number = 5) {
    const user = await userService.getUserWithBudgets(userId);
    const all = user.budgets.flatMap((budget) =>
      budget.transactions.map((tx) => ({
        ...tx,
        budgetName: budget.name,
        budget: budget.name,
      })),
    );
    return all
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getTransactionsByPeriod(userId: string, period: PeriodKey | string) {
    const dateLimit = periodToDateLimit(period);
    const user = await userService.getUserWithBudgets(userId);

    const transactions = user.budgets.flatMap((budget) =>
      budget.transactions
        .filter((tx) => !dateLimit || tx.createdAt >= dateLimit)
        .map((tx) => ({ ...tx, budgetName: budget.name })),
    );

    return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTotalAmountForUser(userId: string): Promise<number> {
    const user = await userService.getUserWithBudgets(userId);
    return user.budgets.reduce(
      (sum, budget) => sum + budget.transactions.reduce((s, tx) => s + tx.amount, 0),
      0,
    );
  }

  async getTotalCountForUser(userId: string): Promise<number> {
    const user = await userService.getUserWithBudgets(userId);
    return user.budgets.reduce((count, budget) => count + budget.transactions.length, 0);
  }
}

export const transactionService = new TransactionService();
