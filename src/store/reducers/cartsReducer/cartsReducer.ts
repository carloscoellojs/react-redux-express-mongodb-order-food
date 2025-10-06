import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Cart, CartsState } from "../../../types/types";

const initialState: CartsState = {
  carts: null,
  message: {
    error: ""
  },
  fetchingCart: false
};
const cartsSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Cart>) {
      state.carts = action.payload;
    },
    addToCartError(state, action: PayloadAction<string>) {
      state.message.error = action.payload;
    },
    updateCartStatus(state, action: PayloadAction<Cart>) {
      state.carts = action.payload;
    },
    updateCartStatusError(state, action: PayloadAction<string>) {
      state.message.error = action.payload;
    },
    removeFromCart(state, action: PayloadAction<Cart>) {
      state.carts = action.payload;
    },
    removeFromCartError(state, action: PayloadAction<string>) {
      state.message.error = action.payload;
    },
    incrementItemQuantity(state, action: PayloadAction<Cart>) {
      state.carts = action.payload;
    },
    incrementItemQuantityError(state, action: PayloadAction<string>) {
      state.message.error = action.payload;
    },
    decrementItemQuantity(state, action: PayloadAction<Cart>) {
      state.carts = action.payload;
    },
    decrementItemQuantityError(state, action: PayloadAction<string>) {
      state.message.error = action.payload;
    },
    startFetchingCart(state, action: PayloadAction<boolean>) {
      state.fetchingCart = action.payload;
    },
    clearCart(state) {
      state.carts = null;
    },
    clearCartError(state, action: PayloadAction<string>) {
      state.message.error = action.payload;
    },
    setFetchingCart(state, action: PayloadAction<boolean>) {
      state.fetchingCart = action.payload;
    }
  }
});

export const {
  addToCart,
  addToCartError,
  updateCartStatus,
  updateCartStatusError,
  removeFromCart,
  removeFromCartError,
  clearCart,
  clearCartError,
  setFetchingCart,
  incrementItemQuantity,
  incrementItemQuantityError,
  decrementItemQuantity,
  decrementItemQuantityError
} = cartsSlice.actions;

export default cartsSlice.reducer;
