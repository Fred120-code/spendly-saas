import { prisma } from "@/lib/prisma";

export interface CreateTransactionData {
  budgetId: string;
  amount: number;
  description: string;
  emoji: string | null;
}

export interface UpdateTransactionData {
  amount: number;
  description: string;
}

export interface TransactionRecord {
  id: string;
  amount: number;
  description: string;
  emoji: string | null;
  budgetId: string | null;
  createdAt: Date;
}

// Type enrichi utilisé pour les listes (dashboard, page transactions)
export interface TransactionWithBudgetName extends TransactionRecord {
  budgetName: string;
}

export interface ITransactionRepository {
  create(data: CreateTransactionData): Promise<TransactionRecord>;
  findById(id: string): Promise<TransactionRecord | null>;
  update(id: string, data: UpdateTransactionData): Promise<TransactionRecord>;
  delete(id: string): Promise<void>;

  // --- Requêtes ciblées (optimisées) ---
  sumAmountByUserId(userId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;

  // Tri et limite faits par MongoDB via l'index sur createdAt.
  findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<TransactionWithBudgetName[]>;

  // Filtre par date fait par MongoDB via l'index sur createdAt.
  findByUserIdAndPeriod(
    userId: string,
    from?: Date,
  ): Promise<TransactionWithBudgetName[]>;
}

export class PrismaTransactionRepository implements ITransactionRepository {
  create(data: CreateTransactionData) {
    return prisma.transaction.create({ data });
  }

  findById(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateTransactionData) {
    return prisma.transaction.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }

  async sumAmountByUserId(userId: string): Promise<number> {
    // aggregate() envoie le calcul directement à MongoDB.
    const result = await prisma.transaction.aggregate({
      where: { budget: { userId } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.transaction.count({
      where: { budget: { userId } },
    });
  }

  async findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<TransactionWithBudgetName[]> {
    // orderBy + take = tri et pagination faits par MongoDB,
    // qui utilise l'index sur createdAt pour ne pas scanner toute la collection.
    const rows = await prisma.transaction.findMany({
      where: { budget: { userId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        budget: { select: { name: true } }, 
      },
    });

    return rows.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      description: tx.description,
      emoji: tx.emoji,
      budgetId: tx.budgetId,
      createdAt: tx.createdAt,
      budgetName: tx.budget?.name ?? "—",
    }));
  }

  async findByUserIdAndPeriod(
    userId: string,
    from?: Date,
  ): Promise<TransactionWithBudgetName[]> {
    const rows = await prisma.transaction.findMany({
      where: {
        budget: { userId },
        ...(from ? { createdAt: { gte: from } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        budget: { select: { name: true } },
      },
    });

    return rows.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      description: tx.description,
      emoji: tx.emoji,
      budgetId: tx.budgetId,
      createdAt: tx.createdAt,
      budgetName: tx.budget?.name ?? "—",
    }));
  }
}

export const transactionRepository: ITransactionRepository =
  new PrismaTransactionRepository();
