import { describe, it, expect, beforeEach, vi } from "vitest";
import { TransactionService } from "./transaction.service";
import { FakeTransactionRepository } from "./__fakes__/fake-transaction.repository";
import { makeTransactionRecord } from "./__fixtures__/transaction.fixtures";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";
import type { BudgetWithTransactions } from "@/modules/budgets/budget.repository";

/**
 * transaction.service.ts importe directement le SINGLETON budgetService
 * (pas une dépendance injectée par constructeur comme le repository).
 * On ne peut donc pas lui passer une fausse version via `new TransactionService(...)`
 * : on remplace le module entier avec vi.mock(), une technique différente
 * mais tout aussi standard.
 */
vi.mock("@/modules/budgets/budget.service", () => ({
  budgetService: { getOwnedBudgetById: vi.fn() },
}));

import { budgetService } from "@/modules/budgets/budget.service";

function makeMockBudget(
  overrides: Partial<BudgetWithTransactions> = {},
): BudgetWithTransactions {
  return {
    id: "budget-1",
    name: "Alimentation",
    amount: 5000,
    emoji: "🍔",
    userId: "user-1",
    createdAt: new Date("2026-01-01"),
    transactions: [],
    ...overrides,
  };
}

describe("TransactionService", () => {
  let repo: FakeTransactionRepository;
  let service: TransactionService;

  beforeEach(() => {
    repo = new FakeTransactionRepository();
    service = new TransactionService(repo);
    vi.mocked(budgetService.getOwnedBudgetById).mockReset();
  });

  describe("addTransactionToOwnedBudget", () => {
    it("ajoute la transaction si le budget appartient à l'utilisateur et qu'il reste de la place", async () => {
      vi.mocked(budgetService.getOwnedBudgetById).mockResolvedValue(
        makeMockBudget({
          transactions: [makeTransactionRecord({ amount: 1000 })],
        }),
      );

      const tx = await service.addTransactionToOwnedBudget("user-1", {
        budgetId: "budget-1",
        amount: 2000,
        description: "Courses",
      });

      expect(tx.amount).toBe(2000);
      expect(budgetService.getOwnedBudgetById).toHaveBeenCalledWith(
        "user-1",
        "budget-1",
      );
    });

    it("refuse si le budget est dépassé", async () => {
      vi.mocked(budgetService.getOwnedBudgetById).mockResolvedValue(
        makeMockBudget({
          amount: 1000,
          transactions: [makeTransactionRecord({ amount: 900 })],
        }),
      );

      await expect(
        service.addTransactionToOwnedBudget("user-1", {
          budgetId: "budget-1",
          amount: 500,
          description: "Trop cher",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejette une description vide avant même de consulter le budget", async () => {
      await expect(
        service.addTransactionToOwnedBudget("user-1", {
          budgetId: "budget-1",
          amount: 500,
          description: "",
        }),
      ).rejects.toThrow("La description est obligatoire");

      expect(budgetService.getOwnedBudgetById).not.toHaveBeenCalled();
    });
  });

  describe("updateOwnedTransaction", () => {
    it("recalcule le total en excluant l'ancien montant de la transaction modifiée", async () => {
      const existing = makeTransactionRecord({
        id: "tx-1",
        amount: 1000,
        budgetId: "budget-1",
      });
      repo.seed([existing]);

      vi.mocked(budgetService.getOwnedBudgetById).mockResolvedValue(
        makeMockBudget({
          transactions: [existing, makeTransactionRecord({ amount: 2000 })],
        }),
      );

      const updated = await service.updateOwnedTransaction("user-1", "tx-1", {
        amount: 1500,
        description: "Courses corrigées",
      });

      expect(updated.amount).toBe(1500);
      expect(updated.description).toBe("Courses corrigées");
    });

    it("refuse la modification si le nouveau montant dépasse le budget disponible", async () => {
      const existing = makeTransactionRecord({
        id: "tx-1",
        amount: 1000,
        budgetId: "budget-1",
      });
      repo.seed([existing]);

      vi.mocked(budgetService.getOwnedBudgetById).mockResolvedValue(
        makeMockBudget({
          amount: 5000,
          transactions: [existing, makeTransactionRecord({ amount: 4000 })],
        }),
      );

      await expect(
        service.updateOwnedTransaction("user-1", "tx-1", {
          amount: 2000,
          description: "Trop cher",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("lève une NotFoundError si la transaction n'existe pas", async () => {
      await expect(
        service.updateOwnedTransaction("user-1", "tx-inexistante", {
          amount: 100,
          description: "Test",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteOwnedTransaction", () => {
    it("supprime la transaction si l'utilisateur possède le budget parent", async () => {
      const existing = makeTransactionRecord({
        id: "tx-1",
        budgetId: "budget-1",
      });
      repo.seed([existing]);
      vi.mocked(budgetService.getOwnedBudgetById).mockResolvedValue(
        makeMockBudget(),
      );

      await service.deleteOwnedTransaction("user-1", "tx-1");

      expect(await repo.findById("tx-1")).toBeNull();
    });

    it("propage l'erreur si l'utilisateur n'est pas propriétaire du budget", async () => {
      const existing = makeTransactionRecord({
        id: "tx-1",
        budgetId: "budget-1",
      });
      repo.seed([existing]);
      vi.mocked(budgetService.getOwnedBudgetById).mockRejectedValue(
        new ForbiddenError(),
      );

      await expect(
        service.deleteOwnedTransaction("user-2", "tx-1"),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
