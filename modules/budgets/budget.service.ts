import { prisma } from "@/lib/prisma";
import {
  budgetRepository,
  type IBudgetRepository,
  type BudgetWithTransactions,
} from "./budget.repository";
import { BudgetValidator } from "./budget.validator";
import type { BudgetInput } from "./budget.validator";
import { NotFoundError, ForbiddenError } from "@/lib/errors/app-error";

function spentAmount(budget: BudgetWithTransactions): number {
  return budget.transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export class BudgetService {
  constructor(private readonly repo: IBudgetRepository = budgetRepository) {}

  async createBudget(userId: string, data: BudgetInput) {
    const validated = BudgetValidator.validateCreateInput(data);
    return this.repo.create({ ...validated, userId });
  }

  async getBudgetsForUser(userId: string) {
    return this.repo.findManyByUserId(userId);
  }

  /**
   * Récupère un budget en vérifiant qu'il appartient bien à `userId`.
   * Toute autre couche (transactions, IA, API routes) DOIT passer par
   * cette méthode pour accéder à un budget précis : c'est elle qui
   * empêche un utilisateur d'accéder aux données d'un autre (IDOR).
   */
  async getOwnedBudgetById(
    userId: string,
    budgetId: string,
  ): Promise<BudgetWithTransactions> {
    const budget = await this.repo.findById(budgetId);
    if (!budget) {
      throw new NotFoundError("Budget introuvable");
    }
    if (budget.userId !== userId) {
      throw new ForbiddenError("Ce budget ne vous appartient pas");
    }
    return budget;
  }

  async deleteOwnedBudget(userId: string, budgetId: string): Promise<void> {
    await this.getOwnedBudgetById(userId, budgetId); // lève une erreur si pas propriétaire
    await this.repo.deleteWithTransactions(budgetId);
  }

  /** Données pour le BarChart du dashboard. */
  async getDistributionData(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      select: {
        name: true,
        amount: true,
        transactions: {
          select: {
            amount: true,
          },
        },
      },
    });

    return budgets.map((b) => ({
      budgetName: b.name,
      totalBudgetAmount: b.amount,
      totalTransactionAmount: b.transactions.reduce((s, t) => s + t.amount, 0),
    }));
  }

  /** Données pour le PieChart du dashboard. */
  async getPieChartData(userId: string) {
    const budgets = await this.repo.findManyByUserId(userId);
    return budgets
      .map((budget) => ({ name: budget.name, value: spentAmount(budget) }))
      .filter((d) => d.value > 0);
  }

  /** Nombre de budgets "atteints" (dépenses >= montant alloué), ex: "2 / 5". */
  async getEndBudgetCount(userId: string): Promise<string> {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
      },
      select: {
        amount: true,
        transactions: {
          select: {
            amount: true,
          },
        },
      },
    });

    const ended = budgets.filter(
      (b) => b.transactions.reduce((s, t) => s + t.amount, 0) == b.amount,
    ).length;

    return `${ended} / ${budgets.length}`;
  }
}

export const budgetService = new BudgetService();
