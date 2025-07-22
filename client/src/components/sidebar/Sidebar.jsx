import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocketContext } from "../../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { setSelectedConversation } from "../../features/conversationSlice";
import { logout } from "../../features/authSlice";
import { getConversationsApi } from "../../api/conversations";
import { getStoriesApi } from "../../api/stories";
import { logoutUserApi } from "../../api/auth";
import SettingsModal from "../modals/SettingsModal";
import CreateGroupModal from "../modals/CreateGroupModal";
import StoryTray from "../stories/StoryTray";
import AddStoryModal from "../modals/AddStoryModal";
import StoryViewer from "../stories/StoryViewer";
import { IoMdAdd } from "react-icons/io";
import { FaUsers } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const ConversationSkeleton = () => (
  <div className="p-4 space-y-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-muted"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const Sidebar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [storyViewerState, setStoryViewerState] = useState({
    open: false,
    index: 0,
  });

  const { onlineUsers } = useSocketContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { userInfo } = useSelector((state) => state.auth);

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversationsApi,
  });
  const { data: storyGroups } = useQuery({
    queryKey: ["stories"],
    queryFn: getStoriesApi,
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logoutUserApi,
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      navigate("/login");
    },
  });

  const getOtherParticipant = (participants) => {
    if (!participants) return null;
    return participants.find((p) => p._id !== userInfo._id);
  };

  const handleSelectConversation = (convo) => {
    const isGroup = convo.isGroupChat;
    const payload = {
      isGroupChat: isGroup,
      conversationId: convo._id,
      ...(isGroup ? convo : getOtherParticipant(convo.participants)),
    };
    dispatch(setSelectedConversation(payload));
  };

  const handleStoryClick = (index) => {
    setStoryViewerState({ open: true, index });
  };

  return (
    <>
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            setIsOpen={setIsSettingsOpen}
          />
        )}
        {isGroupModalOpen && (
          <CreateGroupModal
            isOpen={isGroupModalOpen}
            setIsOpen={setIsGroupModalOpen}
          />
        )}
        {isAddStoryModalOpen && (
          <AddStoryModal
            isOpen={isAddStoryModalOpen}
            setIsOpen={setIsAddStoryModalOpen}
          />
        )}
        {storyViewerState.open && storyGroups && (
          <StoryViewer
            storyGroups={storyGroups}
            initialGroupIndex={storyViewerState.index}
            onClose={() => setStoryViewerState({ open: false, index: 0 })}
          />
        )}
      </AnimatePresence>

      <aside
        className={`w-full flex-shrink-0 md:w-[320px] lg:w-[360px] bg-card border-r border-border flex flex-col h-screen ${
          selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        <header className="p-4 border-b border-border flex-shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/file.svg" alt="Maitri Logo" className="w-48 h-full" />
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
              Chats
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsGroupModalOpen(true)}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted"
            title="Create New Group"
          >
            <IoMdAdd size={24} />
          </motion.button>
        </header>

        <StoryTray
          onStoryClick={handleStoryClick}
          onAddStoryClick={() => setIsAddStoryModalOpen(true)}
        />

        <main className="flex-grow overflow-y-auto scrollbar-thin">
          {isLoadingConversations ? (
            <ConversationSkeleton />
          ) : (
            <AnimatePresence>
              {conversations?.map((convo) => {
                const otherUser = convo.isGroupChat
                  ? null
                  : getOtherParticipant(convo.participants);
                if (!convo.isGroupChat && !otherUser) return null;
                const isSelected =
                  selectedConversation?.conversationId === convo._id;
                const isOnline =
                  !convo.isGroupChat && onlineUsers.includes(otherUser?._id);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    key={convo._id}
                    onClick={() => handleSelectConversation(convo)}
                    className={`flex items-center p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-300 relative ${
                      isSelected
                        ? "bg-primary/10 text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {convo.isGroupChat ? (
                        <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-br from-brand-pink to-brand-orange flex items-center justify-center">
                          <FaUsers size={24} className="text-white" />
                        </div>
                      ) : (
                        <img
                          src={
                            otherUser.profilePicture ||
                            `https://api.dicebear.com/8.x/lorelei/svg?seed=${otherUser.username}`
                          }
                          alt="avatar"
                          className="w-12 h-12 rounded-full mr-4 bg-muted object-cover"
                        />
                      )}
                      {isOnline && (
                        <div className="absolute bottom-0 right-4 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="w-full overflow-hidden">
                      <h2
                        className={`font-bold truncate ${
                          isSelected ? "text-primary" : "text-card-foreground"
                        }`}
                      >
                        {convo.isGroupChat
                          ? convo.groupName
                          : otherUser.username}
                      </h2>
                      <p
                        className={`text-sm truncate ${
                          isSelected
                            ? "text-primary/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {!convo.isGroupChat ? (
                          isOnline ? (
                            <span className="text-green-500">Online</span>
                          ) : otherUser.lastSeen ? (
                            `Last seen ${formatDistanceToNow(
                              new Date(otherUser.lastSeen)
                            )} ago`
                          ) : (
                            "Offline"
                          )
                        ) : (
                          convo.messages[0]?.message || "No messages yet"
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </main>

        <footer className="p-3 border-t border-border mt-auto flex-shrink-0 bg-card">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors duration-200 min-w-0 flex-1"
            >
              <img
                src={
                  userInfo?.profilePicture ||
                  `https://api.dicebear.com/8.x/lorelei/svg?seed=${userInfo?.username}`
                }
                alt="My Avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover flex-shrink-0"
              />
              <span className="font-bold text-card-foreground truncate">
                {userInfo?.username}
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => logoutMutation()}
              className="p-3 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors flex-shrink-0"
              title="Logout"
            >
              <RiLogoutBoxRLine size={22} />
            </motion.button>
          </div>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;
