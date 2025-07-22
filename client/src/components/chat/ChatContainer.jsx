import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMessagesApi, sendMessageApi } from "../../api/messages";
import { useSocketContext } from "../../context/SocketContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import GroupInfoModal from "../modals/GroupInfoModal";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

// --- Welcome Screen Component ---
// A clean and friendly placeholder for when no chat is selected.
const WelcomeScreen = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="flex-1 flex flex-col items-center justify-center h-full text-center bg-background p-4"
  >
    <img src="/file.svg" alt="Maitri Logo" className="w-64 h-64 mb-6" />
    <h1 className="text-4xl font-bold tracking-tight text-card-foreground">
      Welcome to Maitri
    </h1>
    <p className="text-muted-foreground mt-3 max-w-md">
      Select a conversation to begin chatting, or create a new group to get
      started with your friends.
    </p>
  </motion.div>
);

// --- Zod Schema for message validation ---
const messageSchema = z.object({ message: z.string() });

// --- Custom Hook to encapsulate all chat logic ---
const useChat = (conversation) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();

  // --- Data Fetching: Get messages for the selected conversation ---
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversation?.conversationId],
    queryFn: () => getMessagesApi(conversation.conversationId),
    enabled: !!conversation?.conversationId,
  });

  // --- Data Mutation: Send a new message ---
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: sendMessageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversation.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to send message. Please try again."),
  });

  // --- Effect for handling real-time socket events ---
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleNewMessage = (newMessage) => {
      if (conversation?.conversationId === newMessage.conversationId) {
        queryClient.setQueryData(
          ["messages", newMessage.conversationId],
          (oldData) => (oldData ? [...oldData, newMessage] : [newMessage])
        );
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, queryClient, conversation]);

  // --- Effect for marking messages as seen ---
  useEffect(() => {
    if (
      socket &&
      conversation &&
      !conversation.isGroupChat &&
      messages?.length > 0
    ) {
      const hasUnread = messages.some(
        (msg) => !msg.seen && msg.senderId._id === conversation._id
      );
      if (hasUnread) {
        socket.emit("markMessagesAsSeen", {
          conversationId: conversation.conversationId,
          userId: conversation._id,
        });
      }
    }
  }, [socket, conversation, messages]);

  // --- Function to handle typing state changes ---
  const handleTypingChange = () => {
    if (socket && conversation && !conversation.isGroupChat) {
      socket.emit("startTyping", { receiverId: conversation._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: conversation._id });
      }, 2000);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    isSending,
    isTyping,
    handleTypingChange,
  };
};

// --- Main ChatContainer Component ---
// Now cleaner and more focused on presentation logic.
const ChatContainer = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const methods = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  const {
    messages,
    isLoading,
    sendMessage,
    isSending,
    isTyping,
    handleTypingChange,
  } = useChat(selectedConversation);

  const onSendMessage = (data, mediaFile) => {
    if (!data.message.trim() && !mediaFile) return;
    const formData = new FormData();
    formData.append("conversationId", selectedConversation.conversationId);
    if (data.message.trim()) formData.append("message", data.message.trim());
    if (mediaFile) formData.append("image", mediaFile);
    sendMessage(formData);
  };

  if (!selectedConversation) {
    return (
      <div className="hidden md:flex flex-1">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isGroupInfoOpen && selectedConversation.isGroupChat && (
          <GroupInfoModal
            isOpen={isGroupInfoOpen}
            setIsOpen={setIsGroupInfoOpen}
          />
        )}
      </AnimatePresence>
      <div className="flex-1 w-full flex flex-col h-screen bg-background">
        <ChatHeader
          selectedConversation={selectedConversation}
          isTyping={isTyping}
          onGroupInfoClick={() => setIsGroupInfoOpen(true)}
        />
        <MessageList messages={messages} isLoading={isLoading} />
        <FormProvider {...methods}>
          <MessageInput
            onSendMessage={onSendMessage}
            isSending={isSending}
            handleTypingChange={handleTypingChange}
          />
        </FormProvider>
      </div>
    </>
  );
};

export default ChatContainer;
