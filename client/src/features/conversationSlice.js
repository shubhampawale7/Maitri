import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedConversation: null,
  replyingTo: null, // Add state for the message we are replying to
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
      state.replyingTo = null; // Clear reply state when changing conversations
    },
    clearSelectedConversation: (state) => {
      state.selectedConversation = null;
      state.replyingTo = null;
    },
    // New actions for managing reply state
    setReplyingTo: (state, action) => {
      state.replyingTo = action.payload;
    },
    clearReplyingTo: (state) => {
      state.replyingTo = null;
    },
  },
});

export const {
  setSelectedConversation,
  clearSelectedConversation,
  setReplyingTo,
  clearReplyingTo,
} = conversationSlice.actions;

export default conversationSlice.reducer;
