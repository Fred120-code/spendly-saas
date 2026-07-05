import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportService } from "./report.service";
import { computeDataHash } from "./ai-report.repository";
import type { IAiClient } from "./ai-client";
import type { IAiReportRepository } from "./ai-report.repository";
import { ValidationError } from "@/lib/errors/app-error";

vi.mock("@/modules/budgets/budget.service", () => ({
  budgetService: { getDistributionData: vi.fn() },
}));

import { budgetService } from "@/modules/budgets/budget.service";

describe("ReportService", () => {
  let fakeClient: IAiClient;
  let fakeRepo: IAiReportRepository;

  beforeEach(() => {
    fakeClient = { generateText: vi.fn().mockResolvedValue("Rapport généré") };
    fakeRepo = {
      findByUserAndHash: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(budgetService.getDistributionData).mockReset();
  });

  it("retourne le rapport en cache sans appeler l'IA", async () => {
    const stats = [
      {
        budgetName: "Alimentation",
        totalBudgetAmount: 10000,
        totalTransactionAmount: 3000,
      },
    ];
    vi.mocked(budgetService.getDistributionData).mockResolvedValue(stats);
    vi.mocked(fakeRepo.findByUserAndHash).mockResolvedValue({
      report: "Rapport en cache",
    });

    const service = new ReportService(fakeClient, fakeRepo);
    const result = await service.generateMonthlyReport("user-1");

    expect(result).toBe("Rapport en cache");
    expect(fakeClient.generateText).not.toHaveBeenCalled();
    expect(fakeRepo.save).not.toHaveBeenCalled();
  });

  it("génère et met en cache un nouveau rapport si absent", async () => {
    const stats = [
      {
        budgetName: "Transport",
        totalBudgetAmount: 5000,
        totalTransactionAmount: 1000,
      },
    ];
    vi.mocked(budgetService.getDistributionData).mockResolvedValue(stats);

    const service = new ReportService(fakeClient, fakeRepo);
    const result = await service.generateMonthlyReport("user-1");

    expect(result).toBe("Rapport généré");
    expect(fakeClient.generateText).toHaveBeenCalledOnce();
    expect(fakeRepo.save).toHaveBeenCalledWith(
      "user-1",
      computeDataHash(stats),
      "Rapport généré",
    );
  });

  it("lève une ValidationError si aucune donnée budget", async () => {
    vi.mocked(budgetService.getDistributionData).mockResolvedValue([]);

    const service = new ReportService(fakeClient, fakeRepo);

    await expect(service.generateMonthlyReport("user-1")).rejects.toThrow(
      ValidationError,
    );
  });
});
