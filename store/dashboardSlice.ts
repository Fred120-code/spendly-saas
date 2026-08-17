import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardDataAction } from "@/modules/dashboard/dashboard.actions";
import type { Transactions } from "@/modules/transactions/transaction.types";

interface BudgetDistribution {
  budgetName: string;
  totalBudgetAmount: number;
  totalTransactionAmount: number;
}

interface PieDatum extends Record<string, string | number> {
  name: string;
  value: number;
}

interface DashboardState {
  totalAmount: number | null;
  totalCount: number | null;
  totalEndBuget: string | null;
  budgetData: BudgetDistribution[];
  pieData: PieDatum[];
  transactions: Transactions[];
  dailyExpenses: {
    date: string;
    montant: number;
  }[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  totalAmount: null,
  totalCount: null,
  totalEndBuget: null,
  budgetData: [],
  pieData: [],
  transactions: [],
  dailyExpenses: [],
  loading: false,
  loaded: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fechData",
  async (_, { getState }) => {
    const state = getState() as { dashboard: DashboardState };

    if (state.dashboard.loaded) {
      return null;
    }

    return await getDashboardDataAction();
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    invalidateDashboard(state) {
      state.loaded = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        if (!state.loaded) {
          state.loading = true;
        }

        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        if (action.payload === null) return;

        const data = action.payload;
        state.totalAmount = data.amount ?? null;
        state.totalCount = data.count ?? null;
        state.totalEndBuget = data.endBuget ?? null;
        state.budgetData = data.budgetdata ?? [];
        state.pieData = data.piedata ?? [];
        state.dailyExpenses = data.dailyExpenses ?? []

        state.transactions = (data.lastransactions ?? []).map((tx) => {
          const rawTx = tx as Record<string, unknown>;

          return {
            id: String(rawTx.id ?? ""),
            amount: typeof rawTx.amount === "number" ? rawTx.amount : 0,
            emoji:
              rawTx.emoji === null || typeof rawTx.emoji === "string"
                ? (rawTx.emoji as string | null)
                : null,
            description: String(rawTx.description ?? ""),
            createdAt:
              rawTx.createdAt instanceof Date
                ? rawTx.createdAt
                : new Date(String(rawTx.createdAt ?? Date.now())),
            budgetName:
              typeof rawTx.budgetName === "string"
                ? rawTx.budgetName
                : typeof rawTx.budget === "object" &&
                    rawTx.budget !== null &&
                    "name" in rawTx.budget
                  ? String((rawTx.budget as Record<string, unknown>).name)
                  : "—",
          } as Transactions;
        });
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Erreur inconnue";
      });
  },
});

export const { invalidateDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
