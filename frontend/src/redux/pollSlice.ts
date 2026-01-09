import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* -------------------- Types -------------------- */

export interface PollState {
  question: string;
  options: string[];
  duration: number;
  responses: Record<string, number>;
}

/* -------------------- Initial State -------------------- */

const initialState: PollState = {
  question: "",
  options: [],
  duration: 0,
  responses: {},
};

/* -------------------- Slice -------------------- */

export const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setPoll: (state, action: PayloadAction<Partial<PollState>>) => {
      return {
        ...state,
        ...action.payload,
        options: action.payload.options ?? [],
      };
    },
    resetPoll: () => initialState,
  },
});

/* -------------------- Exports -------------------- */

export const { setPoll, resetPoll } = pollSlice.actions;

export default pollSlice.reducer;
