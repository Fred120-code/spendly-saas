import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardDataAction } from "@/modules/dashboard/dashboard.actions";
import type { Transactions } from "@/type";
import build from "next/dist/build";

interface BudgetDistribution {
  budgetName: string;
  totalBudgetAmount: number;
  totalTransactionAmount: number;
}

interface PieDatum {
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
  loading: boolean;
  loaded: boolean; // ← la clé : "est-ce qu'on a déjà chargé une fois ?"
  error: string | null;
}

const initialState: DashboardState = {
  totalAmount: null,
  totalCount: null,
  totalEndBuget: null,
  budgetData: [],
  pieData: [],
  transactions: [],
  loading: false,
  loaded: false,
  error: null,
};

/**
 * createAsyncThunk = une action asynchrone Redux.
 * C'est ici qu'on appelle getDashboardDataAction() (ta Server Action).
 * Redux génère automatiquement 3 états : pending, fulfilled, rejected.
 */
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
        // Si la thunk a retourné null, c'est qu'on a sauté l'appel (déjà chargé)
        if (action.payload === null) return;

        const data = action.payload;
        state.totalAmount = data.amount ?? null;
        state.totalCount = data.count ?? null;
        state.totalEndBuget = data.endBuget ?? null;
        state.budgetData = data.budgetdata ?? [];
        state.pieData = data.piedata ?? [];
        state.transactions = data.lastransactions ?? [];
        state.loading = false;
        state.loaded = true; // maintenant les visites suivantes sont gratuites
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Erreur inconnue";
      });
  },
});

export const { invalidateDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
