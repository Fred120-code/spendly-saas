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
            if(!state.loaded){
                state.loading = true
            }
        })
  }
});
