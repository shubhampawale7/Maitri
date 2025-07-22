import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import conversationReducer from "../features/conversationSlice"; // Import new reducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation: conversationReducer, // Add new reducer
  },
  devTools: true,
});

export default store;
