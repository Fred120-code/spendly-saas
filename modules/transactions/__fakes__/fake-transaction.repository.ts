import type {
  ITransactionRepository,
  TransactionRecord,
  CreateTransactionData,
  UpdateTransactionData,
} from "../transaction.repository";

export class FakeTransactionRepository implements ITransactionRepository {
  constructor(private transactions: TransactionRecord[] = []) {}

  seed(transactions: TransactionRecord[]) {
    this.transactions = transactions;
  }

  async create(data: CreateTransactionData): Promise<TransactionRecord> {
    const transaction: TransactionRecord = {
      id: `tx-${this.transactions.length + 1}`,
      amount: data.amount,
      description: data.description,
      emoji: data.emoji,
      budgetId: data.budgetId,
      createdAt: new Date(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async findById(id: string): Promise<TransactionRecord | null> {
    return this.transactions.find((t) => t.id === id) ?? null;
  }

  async update(
    id: string,
    data: UpdateTransactionData,
  ): Promise<TransactionRecord> {
    const transaction = this.transactions.find((t) => t.id === id);
    if (!transaction) {
      throw new Error(
        `Transaction ${id} introuvable dans le repository factice`,
      );
    }
    transaction.amount = data.amount;
    transaction.description = data.description;
    return transaction;
  }

  async delete(id: string): Promise<void> {
    this.transactions = this.transactions.filter((t) => t.id !== id);
  }
}
