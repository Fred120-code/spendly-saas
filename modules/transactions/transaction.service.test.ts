import {
  transactionRepository,
  type ITransactionRepository,
} from "./transaction.repository";
import {
  TransactionValidator,
  type TransactionInput,
  type TransactionUpdateInput,
} from "./transaction.validator";
import { budgetService } from "@/modules/budgets/budget.service";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors/app-error";

function periodToDateFrom(period: string): Date | undefined {
  const now = new Date();
  switch (period) {
    case "last7": {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      return d;
    }
    case "last30": {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      return d;
    }
    case "last90": {
      const d = new Date(now);
      d.setDate(now.getDate() - 90);
      return d;
    }
    case "last365": {
      const d = new Date(now);
      d.setFullYear(now.getFullYear() - 1);
      return d;
    }
    case "all":
      return undefined; 
    default:
      throw new ValidationError("Période invalide");
  }
}

export class TransactionService {
  constructor(
    private readonly repo: ITransactionRepository = transactionRepository,
  ) {}

  async addTransactionToOwnedBudget(userId: string, data: TransactionInput) {
    TransactionValidator.validateCreateInput(data);

    const budget = await budgetService.getOwnedBudgetById(
      userId,
      data.budgetId,
    );

    const totalSpent = budget.transactions.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    if (totalSpent + data.amount > budget.amount) {
      throw new ValidationError(
        `Budget insuffisant. Montant disponible : ${budget.amount - totalSpent} FCFA`,
      );
    }

    return this.repo.create({
      amount: data.amount,
      description: data.description,
      emoji: budget.emoji,
      budgetId: data.budgetId,
    });
  }

  async updateOwnedTransaction(
    userId: string,
    transactionId: string,
    data: TransactionUpdateInput,
  ) {
    TransactionValidator.validateUpdateInput(data);

    const transaction = await this.repo.findById(transactionId);
    if (!transaction) throw new NotFoundError("Transaction introuvable");
    if (!transaction.budgetId)
      throw new ForbiddenError("Transaction orpheline, modification refusée");

    const budget = await budgetService.getOwnedBudgetById(
      userId,
      transaction.budgetId,
    );

    const totalWithoutThis = budget.transactions
      .filter((tx) => tx.id !== transactionId)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (totalWithoutThis + data.amount > budget.amount) {
      throw new ValidationError(
        `Budget insuffisant. Montant disponible : ${budget.amount - totalWithoutThis} FCFA`,
      );
    }

    return this.repo.update(transactionId, data);
  }

  async deleteOwnedTransaction(
    userId: string,
    transactionId: string,
  ): Promise<void> {
    const transaction = await this.repo.findById(transactionId);
    if (!transaction) throw new NotFoundError("Transaction introuvable");
    if (!transaction.budgetId)
      throw new ForbiddenError("Transaction orpheline, suppression refusée");

    await budgetService.getOwnedBudgetById(userId, transaction.budgetId);
    await this.repo.delete(transactionId);
  }

  // --- Méthodes optimisées ---

  async getLastTransactionsForUser(userId: string, limit: number = 5) {
   
    return this.repo.findRecentByUserId(userId, limit);
  }

  async getTransactionsByPeriod(userId: string, period: string) {
    const from = periodToDateFrom(period);
    return this.repo.findByUserIdAndPeriod(userId, from);
  }

  async getTotalAmountForUser(userId: string): Promise<number> {
    return this.repo.sumAmountByUserId(userId);
  }

  async getTotalCountForUser(userId: string): Promise<number> {

    return this.repo.countByUserId(userId);
  }
}

export const transactionService = new TransactionService();
