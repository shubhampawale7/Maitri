import React from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";

const ChatPage = () => {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* This div creates the beautiful, slow-moving gradient background.
              It's positioned behind the main content and uses a custom animation.
            */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 animate-gradient"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #fecdd3, #fde68a, #bfdbfe, #fbcfe8)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* The main chat UI components */}
      <Sidebar />
      <ChatContainer />
    </div>
  );
};

export default ChatPage;
