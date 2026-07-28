import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionService } from "./transaction.service";
import type { ITransactionRepository } from "./transaction.repository";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

describe("TransactionService.getDailyExpenses", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("regroupe les dépenses par jour sur la période demandée", async () => {
    const repo = {
      findByUserIdAndPeriod: vi.fn().mockResolvedValue([
        {
          id: "tx-1",
          amount: 1000,
          description: "Courses",
          emoji: "🛒",
          budgetId: "budget-1",
          createdAt: new Date("2026-07-25T09:00:00.000Z"),
          budgetName: "Courses",
        },
        {
          id: "tx-2",
          amount: 500,
          description: "Restaurant",
          emoji: "🍽️",
          budgetId: "budget-2",
          createdAt: new Date("2026-07-28T17:00:00.000Z"),
          budgetName: "Restaurant",
        },
      ]),
    } as unknown as ITransactionRepository;

    const service = new TransactionService(repo);
    const result = await service.getDailyExpenses("user-1", 30);

    expect(result).toHaveLength(30);
    expect(
      result.find((item) => item.date === formatDate(new Date("2026-07-25")))
        ?.montant,
    ).toBe(1000);
    expect(
      result.find((item) => item.date === formatDate(new Date("2026-07-28")))
        ?.montant,
    ).toBe(500);
    expect(result.some((item) => item.montant > 0)).toBe(true);
  });
});
