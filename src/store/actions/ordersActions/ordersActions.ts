import axios from "axios";
import type { AppDispatch } from "../../../store";
import {
  placeOrder,
  placeOrderError,
  startPlacingOrder
} from "../../reducers/ordersReducer/ordersReducer";
import type { CreateOrderRequest, OrderApiResponse, ApiError } from "../../../types/types";
import { updateCartStatusAction } from "../cartsActions/cartsActions";
import { delay } from "../../../utils/utils";


export const placeOrderAction =
  (orderData: CreateOrderRequest) => async (dispatch: AppDispatch) => {
    try {
      await delay(true, 2000); // Simulate network delay
      const response = await axios.post<OrderApiResponse>("api/v1/orders", orderData);
      dispatch(placeOrder(response.data));
      dispatch(startPlacingOrderAction(false));
      dispatch(updateCartStatusAction({ _id: orderData.cartId, status: "completed" }));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      dispatch(placeOrderError(apiError.message));
      dispatch(startPlacingOrderAction(false));

    }
  };

export const startPlacingOrderAction =
  (isPlacing: boolean) => async (dispatch: AppDispatch) => {
    // This action can be used to set a loading state if needed
    // For example, you might want to show a spinner while placing the order
    dispatch(startPlacingOrder(isPlacing));
  };
