import axios from "axios";
import type { AppDispatch } from "../../../store";
import {
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
} from "../../reducers/cartsReducer/cartsReducer";
import type { 
  Food, 
  CartApiResponse, 
  UpdateCartStatusRequest, 
  ApiError 
} from "../../../types/types";
import { delay } from "../../../utils/utils";

export const addToCartAction =
  (food: Food) => async (dispatch: AppDispatch) => {
    try {
      await delay(true, 2000); // Simulate network delay
      const response = await axios.post<CartApiResponse>("api/v1/carts", food);
      dispatch(addToCart(response.data.cart));
      dispatch(startFetchingCart(false));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      dispatch(addToCartError(apiError.message));
      dispatch(startFetchingCart(false));

    }
  };

export const updateCartStatusAction =
  (request: UpdateCartStatusRequest) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.patch<CartApiResponse>("api/v1/carts/status", {
        _id: request._id,
        status: request.status
      });
      dispatch(updateCartStatus(response.data.cart));
      dispatch(clearCartAndClearCartErrorAction());
    } catch (error: unknown) {
      const apiError = error as ApiError;
      dispatch(updateCartStatusError(apiError.message));
    }
  };

export const incrementItemQuantityAction =
  (foodId: string) => async (dispatch: AppDispatch) => {
    try {
      await delay(true, 2000); // Simulate network delay
      const response = await axios.patch<CartApiResponse>(
        `api/v1/carts/items/${foodId}/increment`
      );
      dispatch(incrementItemQuantity(response.data.cart));
      dispatch(startFetchingCart(false));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      dispatch(incrementItemQuantityError(apiError.message));
      dispatch(startFetchingCart(false));

    }
  };

export const decrementItemQuantityAction =
  (foodId: string) => async (dispatch: AppDispatch) => {
    try {
      await delay(true, 2000); // Simulate network delay
      const response = await axios.patch<CartApiResponse>(
        `api/v1/carts/items/${foodId}/decrement`
      );
      dispatch(decrementItemQuantity(response.data.cart));
      dispatch(startFetchingCart(false));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      dispatch(decrementItemQuantityError(apiError.message));
    }
  };

export const removeFromCartAction =
  (foodId: string) => async (dispatch: AppDispatch) => {
    try {
      await delay(true, 2000); // Simulate network delay
      const response = await axios.delete<CartApiResponse>(`api/v1/carts/items/${foodId}`);
      dispatch(removeFromCart(response.data.cart));
      dispatch(startFetchingCart(false));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      dispatch(removeFromCartError(apiError.message));
      dispatch(startFetchingCart(false));
    }
  };

export const clearCartAndClearCartErrorAction =
  () => async (dispatch: AppDispatch) => {
    await delay(true, 1000); // Simulate a short delay
    dispatch(clearCart());
    dispatch(clearCartError(""));
  };

export const startFetchingCart =
  (isFetching: boolean) => async (dispatch: AppDispatch) => {
    // This action can be used to set a loading state if needed
    // For example, you might want to show a spinner while fetching the cart
    dispatch(setFetchingCart(isFetching));
  };
