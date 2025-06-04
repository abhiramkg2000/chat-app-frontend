import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { UserType } from "@/types/commonTypes";

const initialState: UserType = { name: "", clientId: "" };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserName: (state: UserType, action: PayloadAction<{ name: string }>) => {
      state.name = action.payload.name;
    },
    setUserClientId: (
      state: UserType,
      action: PayloadAction<{ clientId: string }>
    ) => {
      state.clientId = action.payload.clientId;
    },
    resetUser: () => {
      return initialState;
    },
  },
});

export const { setUserName, setUserClientId, resetUser } = userSlice.actions;
export default userSlice.reducer;
