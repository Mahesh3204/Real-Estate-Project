import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PropertyFilters } from '../services/propertyApi';

interface PropertyState {
  filters: PropertyFilters;
  wizardStep: number;
  activeDraftId: string | null;
}

const initialState: PropertyState = {
  filters: {
    pageNumber: 1,
    pageSize: 10,
    searchQuery: '',
    sortBy: 'newest',
  },
  wizardStep: 1,
  activeDraftId: null,
};

export const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PropertyFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setWizardStep: (state, action: PayloadAction<number>) => {
      state.wizardStep = action.payload;
    },
    setActiveDraftId: (state, action: PayloadAction<string | null>) => {
      state.activeDraftId = action.payload;
    },
    resetWizardState: (state) => {
      state.wizardStep = 1;
      state.activeDraftId = null;
    },
  },
});

export const {
  setFilters,
  resetFilters,
  setWizardStep,
  setActiveDraftId,
  resetWizardState,
} = propertySlice.actions;

export default propertySlice.reducer;
