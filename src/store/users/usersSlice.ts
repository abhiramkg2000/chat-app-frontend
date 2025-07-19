import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { UserSliceType } from "@/types/commonTypes";

const initialState: UserSliceType = {
  name: "",
  roomId: "",
  clientId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserName: (
      state: UserSliceType,
      action: PayloadAction<{ name: string }>
    ) => {
      state.name = action.payload.name;
    },
    setCurrentRoomId: (
      state: UserSliceType,
      action: PayloadAction<{ roomId: string }>
    ) => {
      state.roomId = action.payload.roomId;
    },
    setUserClientId: (
      state: UserSliceType,
      action: PayloadAction<{ clientId: string }>
    ) => {
      state.clientId = action.payload.clientId;
    },
    resetUser: () => {
      return initialState;
    },
  },
});

export const { setUserName, setCurrentRoomId, setUserClientId, resetUser } =
  userSlice.actions;
export default userSlice.reducer;
