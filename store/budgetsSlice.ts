import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyBudgetsAction,
  getMyBudgetByIdAction,
} from "@/modules/budgets/budget.actions";
import type { Budgets } from "@/type";
import type { RootState } from "./index";

interface BudgetsState {
  // --- Page /budgets ---
  list: Budgets[];
  listLoading: boolean;
  listLoaded: boolean;

  // --- Page /manage/[budgetId] ---
  selectedBudget: Budgets | null;
  selectedLoading: boolean;
  selectedLoadedId: string | null; // ID du budget actuellement en store

  error: string | null;
}

const initialState: BudgetsState = {
  list: [],
  listLoading: false,
  listLoaded: false,
  selectedBudget: null,
  selectedLoading: false,
  selectedLoadedId: null,
  error: null,
};

/**
 * Charge la liste des budgets (page /budgets).
 * Si déjà chargée → ne refait rien.
 */
export const fetchBudgets = createAsyncThunk(
  "budgets/fetchList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.budgets.listLoaded) return null;
    return await getMyBudgetsAction();
  },
);

/**
 * Charge UN budget précis avec ses transactions (page /manage/[budgetId]).
 * Si c'est le même ID que celui déjà en store → ne refait rien.
 */
export const fetchBudgetById = createAsyncThunk(
  "budgets/fetchById",
  async (budgetId: string, { getState }) => {
    const state = getState() as RootState;
    if (state.budgets.selectedLoadedId === budgetId) return null;
    return await getMyBudgetByIdAction(budgetId);
  },
);

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    /**
     * Invalide la liste (ex: après création ou suppression d'un budget).
     * Le prochain fetchBudgets refetchera depuis MongoDB.
     */
    invalidateBudgetList(state) {
      state.listLoaded = false;
    },

    /**
     * Invalide le budget sélectionné (ex: après ajout/modif/suppression
     * d'une transaction). Le prochain fetchBudgetById refetchera.
     */
    invalidateSelectedBudget(state) {
      state.selectedLoadedId = null;
    },

    /**
     * Raccourci : invalide TOUT (liste + budget sélectionné).
     * Utilisé quand on supprime un budget (ça affecte les deux pages).
     */
    invalidateAll(state) {
      state.listLoaded = false;
      state.selectedLoadedId = null;
    },
  },
  extraReducers: (builder) => {
    // --- fetchBudgets ---
    builder
      .addCase(fetchBudgets.pending, (state) => {
        if (!state.listLoaded) state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        if (action.payload === null) {
          state.listLoading = false;
          return;
        }
        state.list = action.payload;
        state.listLoading = false;
        state.listLoaded = true;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.error.message ?? "Erreur inconnue";
      });

    // --- fetchBudgetById ---
    builder
      .addCase(fetchBudgetById.pending, (state) => {
        if (!state.selectedLoadedId) state.selectedLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetById.fulfilled, (state, action) => {
        if (action.payload === null) {
          state.selectedLoading = false;
          return;
        }
        state.selectedBudget = action.payload;
        state.selectedLoadedId = action.payload.id;
        state.selectedLoading = false;
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.error = action.error.message ?? "Erreur inconnue";
      });
  },
});

export const { invalidateBudgetList, invalidateSelectedBudget, invalidateAll } =
  budgetsSlice.actions;

export default budgetsSlice.reducer;
