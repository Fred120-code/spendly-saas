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

export interface IBudgetRepository {
  create(data: CreateBudgetData): Promise<BudgetWithTransactions>;
  findById(id: string): Promise<BudgetWithTransactions | null>;
  findManyByUserId(userId: string): Promise<BudgetWithTransactions[]>;
  deleteWithTransactions(id: string): Promise<void>;
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

  /** Supprime le budget et ses transactions de manière atomique. */
  async deleteWithTransactions(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { budgetId: id } }),
      prisma.budget.delete({ where: { id } }),
    ]);
  }
}

export const budgetRepository: IBudgetRepository = new PrismaBudgetRepository();
