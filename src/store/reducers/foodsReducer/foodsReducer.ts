import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FoodsState } from "../../../types/types";

const initialState: FoodsState = {
  items: [],
  message: { error: "" }
};

const foodsSlice = createSlice({
  name: "foods",
  initialState,
  reducers: {
    getFoods: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
    getFoodsError: (state, action: PayloadAction<string>) => {
      state.message.error = action.payload;
    }
  }
});

export const { getFoods, getFoodsError } = foodsSlice.actions;
export default foodsSlice.reducer;
