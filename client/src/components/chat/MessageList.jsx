import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteMessageApi } from "../../api/messages";
import MessageMenu from "./MessageMenu";

// --- Sub-components for better organization ---

/**
 * 💀 Skeleton loader for a more polished loading state.
 */
const MessageSkeleton = () => (
  <div className="space-y-6 p-4 animate-pulse">
    <div className="flex items-end gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-muted"></div>
      <div className="w-2/5 h-12 rounded-lg rounded-bl-none bg-muted"></div>
    </div>
    <div className="flex items-end gap-3 justify-end">
      <div className="w-1/2 h-16 rounded-lg rounded-br-none bg-primary/20"></div>
    </div>
    <div className="flex items-end gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-muted"></div>
      <div className="w-1/3 h-10 rounded-lg rounded-bl-none bg-muted"></div>
    </div>
  </div>
);

/**
 * 💬 Renders a single message bubble with appropriate styling.
 */
const MessageBubble = ({ msg, fromMe, isGroupChat, onAction }) => {
  const messageAlignment = fromMe ? "justify-end" : "justify-start";
  const bubbleStyles = fromMe
    ? "bg-gradient-to-br from-brand-pink to-brand-orange text-white rounded-t-2xl rounded-bl-2xl"
    : "bg-card text-foreground rounded-t-2xl rounded-br-2xl border border-border";

  const renderMessageContent = () => {
    if (msg.messageType === "deleted") {
      return (
        <p className="px-4 py-2 italic text-muted-foreground/80">
          This message was deleted
        </p>
      );
    }
    return (
      <>
        {!fromMe && isGroupChat && (
          <p className="text-xs text-brand-pink font-bold px-4 pt-2">
            {msg.senderId.username}
          </p>
        )}
        {msg.messageType === "image" && (
          <img
            src={msg.mediaUrl}
            alt="Sent media"
            className="rounded-lg max-h-80 p-1.5"
          />
        )}
        {msg.messageType === "video" && (
          <video
            src={msg.mediaUrl}
            controls
            className="rounded-lg max-h-80 p-1.5 w-full"
          />
        )}
        {msg.message && (
          <p className="px-4 py-2.5 break-words">{msg.message}</p>
        )}
      </>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={`group flex items-center gap-2 ${messageAlignment}`}
    >
      {/* Reverse order for 'fromMe' to show menu on the left */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-start ${
          fromMe ? "order-1" : "order-2"
        }`}
      >
        <MessageMenu
          onAction={(action) => onAction(action, msg)}
          fromMe={fromMe}
        />
      </div>

      {!fromMe && (
        <img
          src={
            msg.senderId.profilePicture ||
            `https://api.dicebear.com/8.x/lorelei/svg?seed=${msg.senderId.username}`
          }
          alt="Sender Avatar"
          className="w-8 h-8 rounded-full object-cover self-end order-1"
        />
      )}

      <div
        className={`shadow-md max-w-xs sm:max-w-md md:max-w-lg ${bubbleStyles} ${
          fromMe ? "order-2" : "order-2"
        }`}
      >
        {renderMessageContent()}
      </div>
    </motion.div>
  );
};

/**
 * ✔️ Displays the "Seen" receipt for the last message.
 */
const SeenReceipt = ({ conversation }) => (
  <div className="flex justify-end pr-2 mt-1">
    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
      Seen by
      <img
        src={
          conversation.profilePicture ||
          `https://api.dicebear.com/8.x/lorelei/svg?seed=${conversation.username}`
        }
        alt="Seen by avatar"
        className="w-4 h-4 rounded-full"
      />
    </p>
  </div>
);

// --- Main Component ---

const MessageList = ({ messages, isLoading }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const messageEndRef = useRef(null);

  const { mutate: deleteMessage } = useMutation({
    mutationFn: deleteMessageApi,
    onSuccess: () => toast.success("Message deleted successfully."),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to delete message."),
  });

  // Auto-scroll to the latest message
  useEffect(() => {
    const timer = setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleMessageAction = (action, message) => {
    if (action === "delete") {
      // Using Sonner's toast for confirmation for a better UX
      toast("Delete Message?", {
        description: "Are you sure you want to delete this for everyone?",
        action: {
          label: "Delete",
          onClick: () => deleteMessage(message._id),
        },
        cancel: {
          label: "Cancel",
        },
      });
    } else {
      toast.info(`'${action}' feature is coming soon!`);
    }
  };

  const renderSeenReceipt = () => {
    if (
      !messages ||
      messages.length === 0 ||
      selectedConversation.isGroupChat
    ) {
      return null;
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.senderId._id === userInfo._id && lastMessage?.seen) {
      return <SeenReceipt conversation={selectedConversation} />;
    }
    return null;
  };

  return (
    <main className="flex-grow p-4 md:p-6 overflow-y-auto scrollbar-thin space-y-4">
      {isLoading ? (
        <MessageSkeleton />
      ) : (
        <>
          <AnimatePresence>
            {messages?.map((msg) =>
              msg && msg.senderId ? (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  fromMe={msg.senderId._id === userInfo._id}
                  isGroupChat={selectedConversation.isGroupChat}
                  onAction={handleMessageAction}
                />
              ) : null
            )}
          </AnimatePresence>
          {renderSeenReceipt()}
        </>
      )}
      <div ref={messageEndRef} />
    </main>
  );
};

export default MessageList;
