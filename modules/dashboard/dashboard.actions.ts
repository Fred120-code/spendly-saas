"use server";

import {
  getMyLastTransactionsAction,
  getMyTotalTransactionAmountAction,
  getMyTotalTransactionCountAction,
} from "@/modules/transactions/transaction.actions";

import {
  getMyEndBudgetCountAction,
  getMyBudgetDistributionAction,
  getMyPieChartDataAction,
} from "@/modules/budgets/budget.actions";

export async function getDashboardDataAction() {
  const [amount, count, endBuget, budgetdata, piedata, lastransactions] =
    await Promise.all([
      getMyTotalTransactionAmountAction(),
      getMyTotalTransactionCountAction(),
      getMyEndBudgetCountAction(),
      getMyBudgetDistributionAction(),
      getMyPieChartDataAction(),
      getMyLastTransactionsAction(5),
    ]);

  return {
    amount,
    count,
    endBuget,
    budgetdata,
    piedata,
    lastransactions,
  };
}
