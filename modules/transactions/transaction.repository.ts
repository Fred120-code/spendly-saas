import { prisma } from "@/lib/prisma";

export interface CreateTransactionData {
  budgetId: string;
  amount: number;
  description: string;
  emoji: string | null;
}

export interface TransactionRecord {
  id: string;
  amount: number;
  description: string;
  emoji: string | null;
  budgetId: string | null;
  createdAt: Date;
}

export interface ITransactionRepository {
  create(data: CreateTransactionData): Promise<TransactionRecord>;
  findById(id: string): Promise<TransactionRecord | null>;
  delete(id: string): Promise<void>;
}

export class PrismaTransactionRepository implements ITransactionRepository {
  create(data: CreateTransactionData) {
    return prisma.transaction.create({ data });
  }

  findById(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }
}

export const transactionRepository: ITransactionRepository = new PrismaTransactionRepository();
