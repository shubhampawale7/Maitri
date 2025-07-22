import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "../../context/ThemeContext";
import { BsEmojiSmileFill } from "react-icons/bs";
import { FaImage } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";

// --- Custom Hook for handling clicks outside an element ---
const useClickAway = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// --- Sub-components for a cleaner structure ---

/**
 * 🖼️ Displays a preview of the selected image or video.
 */
const MediaPreview = ({ file, onClear }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, height: 0 }}
    animate={{ opacity: 1, y: 0, height: "auto" }}
    exit={{ opacity: 0, y: 20, height: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="absolute bottom-full left-4 right-4 mb-2 p-2 bg-card/90 backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-border"
  >
    <div className="relative">
      {file.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="max-h-40 rounded-lg mx-auto"
        />
      ) : (
        <video
          src={URL.createObjectURL(file)}
          controls
          muted
          className="max-h-40 rounded-lg mx-auto"
        />
      )}
      <motion.button
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClear}
        className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-md"
        aria-label="Remove media"
      >
        <IoClose size={16} />
      </motion.button>
    </div>
  </motion.div>
);

/**
 * 😊 Button to toggle the emoji picker.
 */
const EmojiPickerButton = ({ onToggle, onEmojiClick, showPicker }) => {
  const { theme } = useTheme();
  const pickerRef = useRef(null);
  useClickAway(pickerRef, () => showPicker && onToggle(false));

  return (
    <div className="relative" ref={pickerRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => onToggle(!showPicker)}
        className="p-2 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Open emoji picker"
      >
        <BsEmojiSmileFill size={22} />
      </motion.button>
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-4 left-0 z-20"
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={theme}
              height={400}
              width={350}
              lazyLoadEmojis
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🚀 The send button, which shows a spinner when sending.
 */
const SendButton = ({ isSending }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    type="submit"
    disabled={isSending}
    className="bg-gradient-to-br from-brand-pink to-brand-orange text-white font-bold p-3 rounded-full disabled:opacity-60 disabled:cursor-not-allowed transition-all shrink-0 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink"
    aria-label="Send message"
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={isSending ? "spinner" : "send"}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        {isSending ? (
          <CgSpinner className="animate-spin" size={20} />
        ) : (
          <IoSend size={20} />
        )}
      </motion.div>
    </AnimatePresence>
  </motion.button>
);

// --- Main Component ---

const MessageInput = ({ onSendMessage, isSending, handleTypingChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, setValue, getValues } =
    useFormContext();

  const onSubmit = (data) => {
    if (!data.message && !mediaFile) return; // Prevent sending empty messages
    onSendMessage(data, mediaFile);
    reset();
    setMediaFile(null);
    setShowPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setValue("message", getValues("message") + emojiObject.emoji, {
      shouldFocus: true,
    });
    handleTypingChange(); // Manually trigger typing indicator
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setMediaFile(file);
    e.target.value = null; // Reset file input
  };

  return (
    <footer className="p-3 md:p-4 border-t border-border flex-shrink-0 relative bg-card/80 backdrop-blur-lg">
      <AnimatePresence>
        {mediaFile && (
          <MediaPreview file={mediaFile} onClear={() => setMediaFile(null)} />
        )}
      </AnimatePresence>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 md:gap-3"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/mp4,video/webm"
        />

        {/* --- Action Buttons --- */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Attach a file"
        >
          <FaImage size={22} />
        </motion.button>

        <EmojiPickerButton
          onToggle={setShowPicker}
          onEmojiClick={handleEmojiClick}
          showPicker={showPicker}
        />

        {/* --- Text Input --- */}
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-4 py-2.5 bg-input rounded-full focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground transition-shadow"
          {...register("message")}
          autoComplete="off"
          onChange={(e) => {
            register("message").onChange(e); // Propagate change to react-hook-form
            handleTypingChange(e); // Then call our custom handler
          }}
        />

        <SendButton isSending={isSending} />
      </form>
    </footer>
  );
};

export default MessageInput;
