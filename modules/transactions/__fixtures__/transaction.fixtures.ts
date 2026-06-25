import type { TransactionRecord } from "../transaction.repository";

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function makeTransactionRecord(
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord {
  return {
    id: nextId("tx"),
    amount: 1000,
    description: "Courses",
    emoji: "🍔",
    budgetId: "budget-1",
    createdAt: new Date("2026-01-02"),
    ...overrides,
  };
}
