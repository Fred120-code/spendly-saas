import type { BudgetWithTransactions } from "../budget.repository";

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Construit un budget fictif avec des valeurs par défaut réalistes.
 * Passe `overrides` pour ne changer que ce qui t'intéresse dans le test :
 *
 *   makeBudget({ amount: 1000, userId: "user-1" })
 */
export function makeBudget(
  overrides: Partial<BudgetWithTransactions> = {},
): BudgetWithTransactions {
  return {
    id: nextId("budget"),
    name: "Alimentation",
    amount: 50000,
    emoji: "🍔",
    userId: "user-1",
    createdAt: new Date("2026-01-01"),
    transactions: [],
    ...overrides,
  };
}

export function makeTransactionRecord(
  overrides: Partial<{
    id: string;
    amount: number;
    description: string;
    emoji: string | null;
    createdAt: Date;
  }> = {},
) {
  return {
    id: nextId("tx"),
    amount: 1000,
    description: "Courses",
    emoji: "🍔",
    createdAt: new Date("2026-01-02"),
    ...overrides,
  };
}
