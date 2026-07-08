import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IOCFilters } from '../../types/ioc.types';
import { DEFAULT_IOC_FILTERS } from '../../types/ioc.types';

interface IOCState {
  filters: IOCFilters;
  currentPage: number;
  pageSize: number;
  selectedIocId: string | null;
}

const initialState: IOCState = {
  filters: DEFAULT_IOC_FILTERS,
  currentPage: 1,
  pageSize: 10,
  selectedIocId: null,
};

const iocSlice = createSlice({
  name: 'ioc',
  initialState,
  reducers: {
    setFilter<K extends keyof IOCFilters>(
      state: IOCState,
      action: PayloadAction<{ key: K; value: IOCFilters[K] }>
    ) {
      (state.filters as IOCFilters)[action.payload.key] = action.payload.value;
      state.currentPage = 1;
    },
    resetFilters(state) {
      state.filters = DEFAULT_IOC_FILTERS;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setSelectedIoc(state, action: PayloadAction<string | null>) {
      state.selectedIocId = action.payload;
    },
  },
});

export const { setFilter, resetFilters, setCurrentPage, setSelectedIoc } = iocSlice.actions;
export default iocSlice.reducer;
