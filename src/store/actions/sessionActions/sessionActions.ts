import axios from "axios";
import type { AppDispatch } from "../../../store";
import {
  sessionError,
  setSessionId
} from "../../reducers/sessionReducer/sessionReducer";
import type { SessionResponse } from "../../../types/types";

export const setSessionIdAction = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post<SessionResponse>("/api/v1/session/init");
    dispatch(setSessionId(response.data.session.userId));
    axios.defaults.headers.common["Session-Id"] = response.data.session.userId;
  } catch (error: unknown) {
    const apiError = error as { message: string };
    dispatch(sessionError(apiError.message));
  }
};
