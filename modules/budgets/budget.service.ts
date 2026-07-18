import {
  budgetRepository,
  type IBudgetRepository,
  type BudgetWithTransactions,
} from "./budget.repository";
import { BudgetValidator, type BudgetInput } from "./budget.validator";
import { NotFoundError, ForbiddenError } from "@/lib/errors/app-error";

function sumTransactions(transactions: { amount: number }[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export class BudgetService {
  constructor(private readonly repo: IBudgetRepository = budgetRepository) {}

  async createBudget(userId: string, data: BudgetInput) {
    BudgetValidator.validateCreateInput(data);
    return this.repo.create({ ...data, userId });
  }

  async getBudgetsForUser(userId: string) {
    return this.repo.findManyByUserId(userId);
  }

  async getOwnedBudgetById(
    userId: string,
    budgetId: string,
  ): Promise<BudgetWithTransactions> {
    const budget = await this.repo.findById(budgetId);
    if (!budget) throw new NotFoundError("Budget introuvable");
    if (budget.userId !== userId)
      throw new ForbiddenError("Ce budget ne vous appartient pas");
    return budget;
  }

  async deleteOwnedBudget(userId: string, budgetId: string): Promise<void> {
    await this.getOwnedBudgetById(userId, budgetId);
    await this.repo.deleteWithTransactions(budgetId);
  }

  async getDistributionData(userId: string) {
    // Requête ciblée : ne charge que name, amount et les montants de
    // transactions — pas description, emoji, createdAt, etc.
    const rows = await this.repo.findDistributionByUserId(userId);
    return rows.map((b) => ({
      budgetName: b.name,
      totalBudgetAmount: b.amount,
      totalTransactionAmount: sumTransactions(b.transactions),
    }));
  }

  async getPieChartData(userId: string) {
    const rows = await this.repo.findAmountsOnlyByUserId(userId);
    return rows
      .map((b) => ({
        name: b.name ?? "—",
        value: sumTransactions(b.transactions),
      }))
      .filter((d) => d.value > 0);
  }

  async getEndBudgetCount(userId: string): Promise<string> {
    // Requête ciblée : uniquement les montants pour comparer.
    const rows = await this.repo.findAmountsOnlyByUserId(userId);
    const ended = rows.filter(
      (b) => sumTransactions(b.transactions) >= b.amount,
    ).length;
    return `${ended} / ${rows.length}`;
  }
}

export const budgetService = new BudgetService();
