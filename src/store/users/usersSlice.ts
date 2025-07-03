import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { clientId: string } = { clientId: "" };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserClientId: (
      state: { clientId: string },
      action: PayloadAction<{ clientId: string }>
    ) => {
      state.clientId = action.payload.clientId;
    },
    resetUser: () => {
      return initialState;
    },
  },
});

export const { setUserClientId, resetUser } = userSlice.actions;
export default userSlice.reducer;
