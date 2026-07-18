import { createSlice } from '@reduxjs/toolkit';

interface LoaderState {
  isLoading: boolean;
  requestCount: number;
}

const initialState: LoaderState = {
  isLoading: false,
  requestCount: 0,
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state) => {
      state.requestCount += 1;
      state.isLoading = true;
    },
    hideLoader: (state) => {
      state.requestCount = Math.max(0, state.requestCount - 1);
      state.isLoading = state.requestCount > 0;
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
