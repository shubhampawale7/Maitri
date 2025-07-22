import React from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { clearReplyingTo } from "../../features/conversationSlice";

const ReplyPreview = ({ message }) => {
  const dispatch = useDispatch();

  if (!message) return null;

  const messageContent =
    message.messageType === "text"
      ? message.message
      : `Sent a ${message.messageType}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full left-0 right-0 p-4"
    >
      <div className="bg-card/90 backdrop-blur-lg p-3 rounded-t-lg border-b-2 border-primary flex justify-between items-center shadow-md">
        <div className="overflow-hidden">
          <p className="font-bold text-sm text-primary">
            Replying to {message.senderId.username}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {messageContent}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => dispatch(clearReplyingTo())}
          className="p-1 text-muted-foreground hover:text-rose-500 rounded-full hover:bg-rose-100"
        >
          <IoClose size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReplyPreview;
