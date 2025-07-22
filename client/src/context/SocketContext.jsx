import React, { createContext, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";
import {
  setSelectedConversation,
  clearSelectedConversation,
} from "../features/conversationSlice";
import { toast } from "sonner";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
        query: { userId: userInfo._id },
      });

      setSocket(newSocket);

      newSocket.on("get-online-users", (users) => setOnlineUsers(users));

      const handleGroupUpdate = (updatedConversation) => {
        queryClient.setQueryData(["conversations"], (oldData) =>
          oldData?.map((convo) =>
            convo._id === updatedConversation._id ? updatedConversation : convo
          )
        );
        if (selectedConversation?.conversationId === updatedConversation._id) {
          const formattedConversation = {
            ...updatedConversation,
            conversationId: updatedConversation._id,
          };
          dispatch(setSelectedConversation(formattedConversation));
        }
        toast.info(
          `Group "${updatedConversation.groupName}" has been updated.`
        );
      };

      const handleRemoval = ({ conversationId, groupName }) => {
        queryClient.setQueryData(["conversations"], (oldData) =>
          oldData?.filter((convo) => convo._id !== conversationId)
        );
        if (selectedConversation?.conversationId === conversationId) {
          dispatch(clearSelectedConversation());
        }
        toast.warning(`You have been removed from the group "${groupName}".`);
      };

      const handleMessagesSeen = ({ conversationId }) => {
        queryClient.setQueryData(["messages", conversationId], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((msg) => ({ ...msg, seen: true }));
        });
      };

      const handleMessageDeleted = ({ conversationId, messageId }) => {
        queryClient.setQueryData(["messages", conversationId], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  message: "This message was deleted",
                  messageType: "deleted",
                  mediaUrl: "",
                }
              : msg
          );
        });
      };

      newSocket.on("groupUpdated", handleGroupUpdate);
      newSocket.on("youWereRemoved", handleRemoval);
      newSocket.on("messagesSeen", handleMessagesSeen);
      newSocket.on("messageDeleted", handleMessageDeleted);

      return () => {
        newSocket.close();
        newSocket.off("groupUpdated", handleGroupUpdate);
        newSocket.off("youWereRemoved", handleRemoval);
        newSocket.off("messagesSeen", handleMessagesSeen);
        newSocket.off("messageDeleted", handleMessageDeleted);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [userInfo, queryClient, dispatch, selectedConversation]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
