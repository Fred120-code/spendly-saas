import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Transactions } from "@/type";
import { getMyTransactionsByPeriodAction } from "@/modules/transactions/transaction.actions";

interface TransactionSate {
  transactions: Transactions[];
  period: string;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: TransactionSate = {
  transactions: [],
  period: "",
  loading: false,
  loaded: false,
  error: null,
};

const fetchTransactionData = createAsyncThunk(
  "transaction/fetchData",
  async (_, { getState }) => {
    const state = getState() as { transactions: TransactionSate };

    if (state.transactions.loaded) {
      return null;
    }

    return await getMyTransactionsByPeriodAction(state.transactions.period);
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
        state.period = "";
        state.loading = false;
        state.loaded = false;
      })
      .addCase(fetchTransactionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Erreur inconnue";
      });
  },
});

export const { invalidateTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
