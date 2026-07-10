import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import transactionsReducer from "./transactionSlice";
import budgetsReducer from "./budgetsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    budgets: budgetsReducer,
    transactions: transactionsReducer,
  },
});

// Types dérivés automatiquement du store — utilisés dans useSelector et useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
