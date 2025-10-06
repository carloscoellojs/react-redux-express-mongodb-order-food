import { createSlice } from "@reduxjs/toolkit";
import type { SessionState } from "../../../types/types";

const initialState: SessionState = {
  sessionId: "" as string,
  message: { error: "" }
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionId(state, action) {
      state.sessionId = action.payload;
    },
    sessionError(state, action) {
      state.message.error = action.payload;
    }
  }
});

export const { setSessionId, sessionError } = sessionSlice.actions;

export default sessionSlice.reducer;
