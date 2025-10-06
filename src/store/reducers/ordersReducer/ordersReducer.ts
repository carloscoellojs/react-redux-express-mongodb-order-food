import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    order: {} as any,
    message: { error: "" },
    startPlacingOrder: false
  },
  reducers: {
    placeOrder(state, action) {
      state.order = action.payload;
    },
    placeOrderError(state, action) {
      state.message.error = action.payload;
    },
    startPlacingOrder(state, action) {
      state.startPlacingOrder = action.payload;
    }
  }
});

export const { placeOrder, placeOrderError, startPlacingOrder } =
  ordersSlice.actions;

export default ordersSlice.reducer;
