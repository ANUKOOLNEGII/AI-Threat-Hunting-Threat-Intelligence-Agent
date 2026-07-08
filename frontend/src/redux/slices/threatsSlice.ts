import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ThreatFilters } from '../../types/threat.types';
import { DEFAULT_FILTERS } from '../../types/threat.types';

interface ThreatsState {
  filters: ThreatFilters;
  currentPage: number;
  pageSize: number;
  selectedThreatId: string | null;
}

const initialState: ThreatsState = {
  filters: DEFAULT_FILTERS,
  currentPage: 1,
  pageSize: 10,
  selectedThreatId: null,
};

const threatsSlice = createSlice({
  name: 'threats',
  initialState,
  reducers: {
    setFilter<K extends keyof ThreatFilters>(
      state: ThreatsState,
      action: PayloadAction<{ key: K; value: ThreatFilters[K] }>
    ) {
      (state.filters as ThreatFilters)[action.payload.key] = action.payload.value;
      state.currentPage = 1; // reset to page 1 on filter change
    },
    resetFilters(state) {
      state.filters = DEFAULT_FILTERS;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setSelectedThreat(state, action: PayloadAction<string | null>) {
      state.selectedThreatId = action.payload;
    },
  },
});

export const { setFilter, resetFilters, setCurrentPage, setSelectedThreat } =
  threatsSlice.actions;

export default threatsSlice.reducer;
