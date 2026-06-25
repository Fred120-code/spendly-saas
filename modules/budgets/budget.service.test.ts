import { describe, it, expect, beforeEach } from "vitest";
import { BudgetService } from "./budget.service";
import { FakeBudgetRepository } from "./__fakes__/fake-budget.repository";
import {
  makeBudget,
  makeTransactionRecord,
} from "./__fixtures__/budget.fixtures";
import { NotFoundError, ForbiddenError } from "@/lib/errors/app-error";

describe("BudgetService", () => {
  let repo: FakeBudgetRepository;
  let service: BudgetService;

  // Recrée un repository et un service neufs avant CHAQUE test,
  // pour qu'un test ne pollue jamais le suivant avec ses données.
  beforeEach(() => {
    repo = new FakeBudgetRepository();
    service = new BudgetService(repo);
  });

  describe("createBudget", () => {
    it("crée un budget valide pour l'utilisateur donné", async () => {
      const budget = await service.createBudget("user-1", {
        name: "Loisirs",
        amount: 20000,
        emoji: "🎮",
      });

      expect(budget.name).toBe("Loisirs");
      expect(budget.userId).toBe("user-1");
    });

    it("rejette un montant négatif ou nul", async () => {
      await expect(
        service.createBudget("user-1", {
          name: "Loisirs",
          amount: 0,
          emoji: "🎮",
        }),
      ).rejects.toThrow("Le montant du budget doit être supérieur à 0");
    });

    it("rejette un nom vide", async () => {
      await expect(
        service.createBudget("user-1", { name: "", amount: 1000, emoji: "🎮" }),
      ).rejects.toThrow("Le nom du budget est obligatoire");
    });
  });

  describe("getOwnedBudgetById", () => {
    it("renvoie le budget si l'utilisateur en est propriétaire", async () => {
      const seeded = makeBudget({ userId: "user-1" });
      repo.seed([seeded]);

      const result = await service.getOwnedBudgetById("user-1", seeded.id);

      expect(result.id).toBe(seeded.id);
    });

    it("lève une NotFoundError si le budget n'existe pas", async () => {
      await expect(
        service.getOwnedBudgetById("user-1", "budget-inexistant"),
      ).rejects.toThrow(NotFoundError);
    });

    it("lève une ForbiddenError si l'utilisateur n'est pas le propriétaire", async () => {
      const seeded = makeBudget({ userId: "user-1" });
      repo.seed([seeded]);

      // "user-2" essaie d'accéder au budget de "user-1" : c'est exactement
      // le scénario IDOR qu'on a corrigé dans le vrai code.
      await expect(
        service.getOwnedBudgetById("user-2", seeded.id),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("deleteOwnedBudget", () => {
    it("supprime le budget si l'utilisateur en est propriétaire", async () => {
      const seeded = makeBudget({ userId: "user-1" });
      repo.seed([seeded]);

      await service.deleteOwnedBudget("user-1", seeded.id);

      await expect(
        service.getOwnedBudgetById("user-1", seeded.id),
      ).rejects.toThrow(NotFoundError);
    });

    it("refuse la suppression si l'utilisateur n'est pas propriétaire", async () => {
      const seeded = makeBudget({ userId: "user-1" });
      repo.seed([seeded]);

      await expect(
        service.deleteOwnedBudget("user-2", seeded.id),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getEndBudgetCount", () => {
    it("compte les budgets dont les dépenses atteignent le montant alloué", async () => {
      const budgetAtteint = makeBudget({
        userId: "user-1",
        amount: 1000,
        transactions: [makeTransactionRecord({ amount: 1000 })],
      });
      const budgetNonAtteint = makeBudget({
        userId: "user-1",
        amount: 1000,
        transactions: [makeTransactionRecord({ amount: 200 })],
      });
      repo.seed([budgetAtteint, budgetNonAtteint]);

      const result = await service.getEndBudgetCount("user-1");

      expect(result).toBe("1 / 2");
    });
  });
});
