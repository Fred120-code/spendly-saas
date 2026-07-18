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
import { userService } from "@/modules/users/user.service";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors/app-error";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

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
  constructor(
    private readonly repo: ITransactionRepository = transactionRepository,
  ) {}

  /**
   * Ajoute une transaction à un budget, en vérifiant via budgetService que
   * `userId` est bien le propriétaire de ce budget (corrige l'IDOR de
   * l'ancien addTansactionToBuget(budgetId, ...) qui ne vérifiait rien).
   */
  async addTransactionToOwnedBudget(userId: string, data: TransactionInput) {
    const validated = TransactionValidator.validateCreateInput(data);

    const budget = await budgetService.getOwnedBudgetById(
      userId,
      validated.budgetId,
    );

    const totalSpent = budget.transactions.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    const totalWithTransaction = totalSpent + validated.amount;
    if (totalWithTransaction > budget.amount) {
      throw new ValidationError(
        `Budget insuffisant. Montant disponible: ${formatMoney(budget.amount - totalSpent)}`,
      );
    }

    return this.repo.create({
      amount: validated.amount,
      description: validated.description,
      emoji: budget.emoji,
      budgetId: validated.budgetId,
    });
  }

  /**
   * Modifie une transaction existante, en revérifiant l'ownership et le
   * budget disponible (en excluant l'ancien montant de cette transaction
   * du calcul, puisqu'on est en train de le remplacer).
   */
  async updateOwnedTransaction(
    userId: string,
    transactionId: string,
    data: TransactionUpdateInput,
  ) {
    const validated = TransactionValidator.validateUpdateInput(data);

    const transaction = await this.repo.findById(transactionId);
    if (!transaction) {
      throw new NotFoundError("Transaction introuvable");
    }
    if (!transaction.budgetId) {
      throw new ForbiddenError("Transaction orpheline, modification refusée");
    }

    //verifier que l'utilisateur possede bien le budget parent
    const budget = await budgetService.getOwnedBudgetById(
      userId,
      transaction.budgetId,
    );

    //recalcule le total depensé en excluant l'ancien montant de cette transaction,
    //puis ajoute le nouveau montant proposé
    const totalSpentWithoutThisTx = budget.transactions
      .filter((tx) => tx.id !== transactionId)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (totalSpentWithoutThisTx + validated.amount > budget.amount) {
      throw new ValidationError(
        `Budget insuffisant. Montant disponible: ${formatMoney(budget.amount - totalSpentWithoutThisTx)}`,
      );
    }

    return this.repo.update(transactionId, validated);
  }

  async deleteOwnedTransaction(
    userId: string,
    transactionId: string,
  ): Promise<void> {
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
    return prisma.transaction.findMany({
      where: {
        budget: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        budget: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getTransactionsByPeriod(userId: string, period: PeriodKey | string) {
    const dateLimit = periodToDateLimit(period);
    return prisma.transaction.findMany({
      where: {
        budget: { userId },
        ...(dateLimit ? { createdAt: { gte: dateLimit } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { budget: { select: { name: true } } },
    });
  }

  async getTotalAmountForUser(userId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        budget: {
          userId,
        },
      },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  async getTotalCountForUser(userId: string): Promise<number> {
    return prisma.transaction.count({
      where: {
        budget: {
          userId,
        },
      },
    });
  }
}

export const transactionService = new TransactionService();
