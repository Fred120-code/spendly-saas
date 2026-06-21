"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { budgetService } from "./budget.service";
import type { BudgetInput } from "./budget.validator";

export async function createBudgetAction(input: BudgetInput) {
  const user = await requireCurrentUser();
  return budgetService.createBudget(user.id, input);
}

export async function getMyBudgetsAction() {
  const user = await requireCurrentUser();
  return budgetService.getBudgetsForUser(user.id);
}

export async function getMyBudgetByIdAction(budgetId: string) {
  const user = await requireCurrentUser();
  return budgetService.getOwnedBudgetById(user.id, budgetId);
}

export async function deleteMyBudgetAction(budgetId: string) {
  const user = await requireCurrentUser();
  await budgetService.deleteOwnedBudget(user.id, budgetId);
}

export async function getMyBudgetDistributionAction() {
  const user = await requireCurrentUser();
  return budgetService.getDistributionData(user.id);
}

export async function getMyPieChartDataAction() {
  const user = await requireCurrentUser();
  return budgetService.getPieChartData(user.id);
}

export async function getMyEndBudgetCountAction() {
  const user = await requireCurrentUser();
  return budgetService.getEndBudgetCount(user.id);
}
