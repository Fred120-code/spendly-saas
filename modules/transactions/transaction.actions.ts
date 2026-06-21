"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { transactionService } from "./transaction.service";
import type { TransactionInput } from "./transaction.validator";

export async function addTransactionAction(input: TransactionInput) {
  const user = await requireCurrentUser();
  return transactionService.addTransactionToOwnedBudget(user.id, input);
}

export async function deleteMyTransactionAction(transactionId: string) {
  const user = await requireCurrentUser();
  await transactionService.deleteOwnedTransaction(user.id, transactionId);
}

export async function getMyLastTransactionsAction(limit: number = 5) {
  const user = await requireCurrentUser();
  return transactionService.getLastTransactionsForUser(user.id, limit);
}

export async function getMyTransactionsByPeriodAction(period: string) {
  const user = await requireCurrentUser();
  return transactionService.getTransactionsByPeriod(user.id, period);
}

export async function getMyTotalTransactionAmountAction() {
  const user = await requireCurrentUser();
  return transactionService.getTotalAmountForUser(user.id);
}

export async function getMyTotalTransactionCountAction() {
  const user = await requireCurrentUser();
  return transactionService.getTotalCountForUser(user.id);
}
