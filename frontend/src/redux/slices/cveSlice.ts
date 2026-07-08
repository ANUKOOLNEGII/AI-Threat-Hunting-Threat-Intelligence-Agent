import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CVEFilters } from '../../types/cve.types';
import { DEFAULT_CVE_FILTERS } from '../../types/cve.types';

interface CVEState {
  filters: CVEFilters;
  currentPage: number;
  pageSize: number;
  selectedCveId: string | null;
}

const initialState: CVEState = {
  filters: DEFAULT_CVE_FILTERS,
  currentPage: 1,
  pageSize: 10,
  selectedCveId: null,
};

const cveSlice = createSlice({
  name: 'cve',
  initialState,
  reducers: {
    setFilter<K extends keyof CVEFilters>(
      state: CVEState,
      action: PayloadAction<{ key: K; value: CVEFilters[K] }>
    ) {
      (state.filters as CVEFilters)[action.payload.key] = action.payload.value;
      state.currentPage = 1;
    },
    resetFilters(state) {
      state.filters = DEFAULT_CVE_FILTERS;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setSelectedCve(state, action: PayloadAction<string | null>) {
      state.selectedCveId = action.payload;
    },
  },
});

export const { setFilter, resetFilters, setCurrentPage, setSelectedCve } = cveSlice.actions;
export default cveSlice.reducer;
