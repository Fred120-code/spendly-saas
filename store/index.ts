import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    // tu ajouteras ici d'autres slices plus tard :
    // budgets: budgetsReducer,
    // transactions: transactionsReducer,
  },
});

// Types dérivés automatiquement du store — utilisés dans useSelector et useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
