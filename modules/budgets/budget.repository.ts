import { prisma } from "@/lib/prisma";

export interface CreateBudgetData {
  name: string;
  amount: number;
  emoji: string;
  userId: string;
}

export interface BudgetWithTransactions {
  id: string;
  name: string;
  amount: number;
  emoji: string | null;
  userId: string;
  createdAt: Date;
  transactions: {
    id: string;
    amount: number;
    description: string;
    emoji: string | null;
    createdAt: Date;
  }[];
}

// Type allégé : uniquement les champs nécessaires aux calculs de stats
export interface BudgetAmountWithTransactionAmounts {
  name: string;
  amount: number;
  transactions: { amount: number }[];
}

// Type allégé pour les graphiques du dashboard
export interface BudgetDistributionRow {
  name: string;
  amount: number;
  transactions: { amount: number }[];
}

export interface IBudgetRepository {
  create(data: CreateBudgetData): Promise<BudgetWithTransactions>;
  findById(id: string): Promise<BudgetWithTransactions | null>;
  findManyByUserId(userId: string): Promise<BudgetWithTransactions[]>;
  deleteWithTransactions(id: string): Promise<void>;

  // --- Requêtes ciblées (optimisées) ---
  findDistributionByUserId(userId: string): Promise<BudgetDistributionRow[]>;

  findAmountsOnlyByUserId(
    userId: string,
  ): Promise<BudgetAmountWithTransactionAmounts[]>;
}

export class PrismaBudgetRepository implements IBudgetRepository {
  create(data: CreateBudgetData) {
    return prisma.budget.create({
      data,
      include: { transactions: true },
    });
  }

  findById(id: string) {
    return prisma.budget.findUnique({
      where: { id },
      include: { transactions: true },
    });
  }

  findManyByUserId(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      include: { transactions: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteWithTransactions(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { budgetId: id } }),
      prisma.budget.delete({ where: { id } }),
    ]);
  }

  findDistributionByUserId(userId: string): Promise<BudgetDistributionRow[]> {
    return prisma.budget.findMany({
      where: { userId },
      select: {
        name: true,
        amount: true,
        transactions: {
          select: { amount: true },
        },
      },
    });
  }

  findAmountsOnlyByUserId(
    userId: string,
  ): Promise<BudgetAmountWithTransactionAmounts[]> {
    // Charge uniquement les montants, rien d'autre.
    return prisma.budget.findMany({
      where: { userId },
      select: {
        name:true,
        amount: true,
        transactions: {
          select: { amount: true },
        },
      },
    });
  }
}

export const budgetRepository: IBudgetRepository = new PrismaBudgetRepository();
