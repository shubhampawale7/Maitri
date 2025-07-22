import React from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setSelectedConversation } from "../../features/conversationSlice";
import { FaCog } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

// --- Sub-components for better organization and readability ---

/**
 * 🟢 Renders the user/group avatar with an online status indicator.
 */
const AvatarStatus = ({ conversation }) => {
  const avatarUrl = conversation.isGroupChat
    ? conversation.groupIcon ||
      `https://api.dicebear.com/8.x/initials/svg?seed=${conversation.groupName}`
    : conversation.profilePicture ||
      `https://api.dicebear.com/8.x/lorelei/svg?seed=${conversation.username}`;

  return (
    <div className="relative flex-shrink-0">
      <img
        src={avatarUrl}
        alt="Avatar"
        className="w-11 h-11 rounded-full object-cover bg-muted border-2 border-background"
      />
      {/* A subtle online indicator for non-group chats */}
      {!conversation.isGroupChat && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      )}
    </div>
  );
};

/**
 * 💬 Displays an animated typing indicator.
 */
const TypingIndicator = () => (
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
    className="text-xs text-brand-teal font-medium absolute top-full mt-0.5"
  >
    typing...
  </motion.p>
);

/**
 * ⚙️ Renders the settings button for group chats with a playful animation.
 */
const GroupSettingsButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1, rotate: 25 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    onClick={onClick}
    className="p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-muted transition-colors"
    aria-label="Group settings"
  >
    <FaCog size={20} />
  </motion.button>
);

// --- Main Component ---

const ChatHeader = ({ selectedConversation, isTyping, onGroupInfoClick }) => {
  const dispatch = useDispatch();

  const handleBackClick = () => {
    dispatch(setSelectedConversation(null));
  };

  const headerTitle = selectedConversation.isGroupChat
    ? selectedConversation.groupName
    : selectedConversation.username;

  return (
    <header className="p-4 border-b border-border flex items-center justify-between flex-shrink-0 bg-card/90 backdrop-blur-lg z-10 sticky top-0">
      {/* --- Left Section: Back Button & Conversation Info --- */}
      <motion.div
        key={selectedConversation.conversationId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "circOut" }}
        className="flex items-center gap-3.5 min-w-0"
      >
        {/* Back button for mobile view */}
        <motion.button
          onClick={handleBackClick}
          className="p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-muted transition-colors md:hidden"
          aria-label="Back to conversations"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IoArrowBack size={22} />
        </motion.button>

        <AvatarStatus conversation={selectedConversation} />

        <div className="min-w-0 relative">
          <h2 className="font-bold text-card-foreground text-lg truncate pr-2">
            {headerTitle}
          </h2>
          <AnimatePresence>
            {isTyping && !selectedConversation.isGroupChat && (
              <TypingIndicator />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- Right Section: Action Buttons --- */}
      {selectedConversation.isGroupChat && (
        <GroupSettingsButton onClick={onGroupInfoClick} />
      )}
    </header>
  );
};

export default ChatHeader;
