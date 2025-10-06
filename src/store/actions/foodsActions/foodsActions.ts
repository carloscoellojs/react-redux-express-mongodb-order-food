import axios from "axios";
import type { AppDispatch } from "../../../store";
import {
  getFoods,
  getFoodsError
} from "../../reducers/foodsReducer/foodsReducer";
import { delay } from "../../../utils/utils";
import type { ApiError } from "../../../types/types";

export const fetchFoods = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get("api/v1/foods");
    await delay(true, 2000);
    dispatch(getFoods(response.data));
  } catch (error: unknown) {
    const apiError = error as ApiError;
    dispatch(getFoodsError(apiError.message));
  }
};
