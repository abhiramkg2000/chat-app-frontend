import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MessageType, MessageListType } from "@/types/commonTypes";

const initialState: MessageListType = [];

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessages: (state: MessageListType, action: PayloadAction<MessageType>) => {
      state.push(action.payload);
    },
    resetMessages: () => {
      return initialState;
    },
  },
});

export const { addMessages, resetMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
