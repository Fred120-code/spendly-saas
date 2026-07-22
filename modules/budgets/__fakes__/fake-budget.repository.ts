import type {
  IBudgetRepository,
  BudgetWithTransactions,
  CreateBudgetData,
  BudgetAmountWithTransactionAmounts,
  BudgetDistributionRow,
} from "../budget.repository";

/**
 * Implémente exactement la même interface que PrismaBudgetRepository,
 * mais garde tout en mémoire dans un simple tableau. Comme BudgetService
 * ne connaît que l'interface IBudgetRepository, il ne voit aucune
 * différence entre celui-ci et le vrai.
 */
export class FakeBudgetRepository implements IBudgetRepository {
  constructor(private budgets: BudgetWithTransactions[] = []) {}

  /** Permet d'injecter des données de départ depuis un test. */
  seed(budgets: BudgetWithTransactions[]) {
    this.budgets = budgets;
  }

  async create(data: CreateBudgetData): Promise<BudgetWithTransactions> {
    const budget: BudgetWithTransactions = {
      id: `budget-${this.budgets.length + 1}`,
      name: data.name,
      amount: data.amount,
      emoji: data.emoji,
      userId: data.userId,
      createdAt: new Date(),
      transactions: [],
    };
    this.budgets.push(budget);
    return budget;
  }

  async findById(id: string): Promise<BudgetWithTransactions | null> {
    return this.budgets.find((b) => b.id === id) ?? null;
  }

  async findManyByUserId(userId: string): Promise<BudgetWithTransactions[]> {
    return this.budgets.filter((b) => b.userId === userId);
  }

  async deleteWithTransactions(id: string): Promise<void> {
    this.budgets = this.budgets.filter((b) => b.id !== id);
  }

  async findDistributionByUserId(
    userId: string,
  ): Promise<BudgetDistributionRow[]> {
    return this.budgets
      .filter((budget) => budget.userId === userId)
      .map((budget) => ({
        name: budget.name,
        amount: budget.amount,
        transactions: budget.transactions.map((tx) => ({ amount: tx.amount })),
      }));
  }

  async findAmountsOnlyByUserId(
    userId: string,
  ): Promise<BudgetAmountWithTransactionAmounts[]> {
    return this.budgets
      .filter((budget) => budget.userId === userId)
      .map((budget) => ({
        name: budget.name,
        amount: budget.amount,
        transactions: budget.transactions.map((tx) => ({ amount: tx.amount })),
      }));
  }
}
