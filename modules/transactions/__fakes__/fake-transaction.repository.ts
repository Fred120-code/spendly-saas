import type {
  ITransactionRepository,
  TransactionRecord,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionWithBudgetName,
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

  async sumAmountByUserId(_userId: string): Promise<number> {
    return this.transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  async countByUserId(_userId: string): Promise<number> {
    return this.transactions.length;
  }

  async findRecentByUserId(
    _userId: string,
    limit: number,
  ): Promise<TransactionWithBudgetName[]> {
    return this.transactions
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((tx) => ({
        ...tx,
        budgetName: "—",
      }));
  }

  async findByUserIdAndPeriod(
    _userId: string,
    from?: Date,
  ): Promise<TransactionWithBudgetName[]> {
    return this.transactions
      .filter((tx) => (from ? tx.createdAt >= from : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((tx) => ({
        ...tx,
        budgetName: "—",
      }));
  }
}
