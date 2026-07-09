import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Transactions } from "@/type";
import { getMyTransactionsByPeriodAction } from "@/modules/transactions/transaction.actions";

interface TransactionState {
  transactions: Transactions[];
  period: string;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  period: "all",
  loading: false,
  loaded: false,
  error: null,
};

export const fetchTransactionData = createAsyncThunk(
  "transaction/fetchData",
  async (period: string = "all", { getState }) => {
    const state = getState() as { transactions: TransactionState };

    if (state.transactions.loaded && state.transactions.period === period) {
      return null;
    }

    return await getMyTransactionsByPeriodAction(period);
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    invalidateTransaction(state) {
      state.loaded = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionData.pending, (state) => {
        if (!state.loaded) {
          state.loading = true;
        }

        state.error = null;
      })
      .addCase(fetchTransactionData.fulfilled, (state, action) => {
        if (action.payload === null) return;

        const data = action.payload;
        state.transactions = data ?? [];
        state.period = action.meta.arg ?? "all";
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchTransactionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Erreur inconnue";
      });
  },
});

export const { invalidateTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
