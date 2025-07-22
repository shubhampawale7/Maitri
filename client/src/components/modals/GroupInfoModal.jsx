import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  renameGroupApi,
  addToGroupApi,
  removeFromGroupApi,
} from "../../api/groups";
import { getUsersApi } from "../../api/auth";
import { setSelectedConversation } from "../../features/conversationSlice";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiUsers, FiPlusCircle, FiXCircle } from "react-icons/fi";

// --- Sub-component for Admin Controls for better readability ---
const AdminControls = ({
  handleSubmit,
  onRenameSubmit,
  register,
  isRenaming,
  imagePreview,
  fileInputRef,
  handleFileChange,
  groupName,
}) => (
  <form
    onSubmit={handleSubmit(onRenameSubmit)}
    className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 border-b border-slate-200 pb-6 mb-6"
  >
    <div className="relative group flex-shrink-0">
      <img
        src={
          imagePreview ||
          `https://api.dicebear.com/8.x/initials/svg?seed=${groupName}`
        }
        alt="Group Icon"
        className="w-24 h-24 rounded-full object-cover bg-slate-200 ring-4 ring-white"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <FiEdit2 size={32} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
    <div className="flex-grow w-full">
      <label htmlFor="groupName" className="text-sm font-medium text-slate-500">
        Group Name
      </label>
      <input
        id="groupName"
        type="text"
        {...register("groupName")}
        className="w-full mt-1 rounded-lg bg-slate-100 border-slate-200 text-slate-800 shadow-sm focus:border-brand-pink focus:ring-2 focus:ring-brand-pink p-2 transition"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={isRenaming}
        className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-brand-pink to-brand-orange rounded-lg disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
      >
        {isRenaming ? "Saving..." : "Update Group Info"}
      </motion.button>
    </div>
  </form>
);

// --- Sub-component for Participant List Item ---
const ParticipantItem = ({
  participant,
  isCurrentUserAdmin,
  isParticipantAdmin,
  onRemove,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    key={participant._id}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100"
  >
    <div className="flex items-center">
      <img
        src={
          participant.profilePicture ||
          `https://api.dicebear.com/8.x/lorelei/svg?seed=${participant.username}`
        }
        alt={participant.username}
        className="w-9 h-9 rounded-full mr-3 object-cover"
      />
      <span className="text-slate-700">
        {participant.username}{" "}
        {isParticipantAdmin && (
          <span className="text-xs text-brand-pink font-semibold">(Admin)</span>
        )}
      </span>
    </div>
    {isCurrentUserAdmin && !isParticipantAdmin && (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-100 rounded-full"
      >
        <FiXCircle size={18} />
      </motion.button>
    )}
  </motion.div>
);

const GroupInfoModal = ({ isOpen, setIsOpen }) => {
  // --- STATE AND HOOKS ---
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const isAdmin = selectedConversation?.groupAdmin?._id === userInfo?._id;

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { groupName: selectedConversation?.groupName || "" },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  useEffect(() => {
    if (isOpen && selectedConversation) {
      setValue("groupName", selectedConversation.groupName);
      setImagePreview(selectedConversation.groupIcon);
      setImageFile(null);
    }
  }, [isOpen, selectedConversation, setValue]);

  // --- MUTATIONS AND HANDLERS ---
  const handleSuccess = (updatedData) => {
    const formattedConversation = {
      ...updatedData,
      conversationId: updatedData._id,
    };
    dispatch(setSelectedConversation(formattedConversation));
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    toast.success("Group updated successfully!");
  };

  const { mutate: renameGroup, isPending: isRenaming } = useMutation({
    mutationFn: renameGroupApi,
    onSuccess: handleSuccess,
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update group."),
  });
  const { mutate: removeUser } = useMutation({
    mutationFn: removeFromGroupApi,
    onSuccess: handleSuccess,
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to remove user."),
  });
  const { mutate: addUser } = useMutation({
    mutationFn: addToGroupApi,
    onSuccess: handleSuccess,
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to add user."),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const onRenameSubmit = (data) => {
    const formData = new FormData();
    formData.append("conversationId", selectedConversation.conversationId);
    formData.append("groupName", data.groupName);
    if (imageFile) formData.append("groupIcon", imageFile);
    renameGroup(formData);
  };
  const handleAddUser = (e) => {
    const userId = e.target.value;
    if (userId)
      addUser({ conversationId: selectedConversation.conversationId, userId });
    e.target.value = "";
  };

  const usersToAdd = allUsers?.filter(
    (user) =>
      !selectedConversation?.participants.some((p) => p._id === user._id)
  );

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <FiUsers />
                Group Information
              </Dialog.Title>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-500 hover:text-rose-500 rounded-full hover:bg-rose-100"
              >
                <IoClose size={24} />
              </motion.button>
            </div>

            {isAdmin && (
              <AdminControls
                {...{
                  handleSubmit,
                  onRenameSubmit,
                  register,
                  isRenaming,
                  imagePreview,
                  fileInputRef,
                  handleFileChange,
                  groupName: selectedConversation?.groupName,
                }}
              />
            )}

            <div className="mb-4">
              <h3 className="font-semibold text-slate-600 mb-2">
                {selectedConversation?.participants.length} Participants
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                <AnimatePresence>
                  {selectedConversation?.participants.map((p) => (
                    <ParticipantItem
                      key={p._id}
                      participant={p}
                      isCurrentUserAdmin={isAdmin}
                      isParticipantAdmin={
                        p._id === selectedConversation.groupAdmin._id
                      }
                      onRemove={() =>
                        removeUser({
                          conversationId: selectedConversation.conversationId,
                          userId: p._id,
                        })
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {isAdmin && (
              <div className="border-t border-slate-200 pt-4">
                <label
                  htmlFor="add-user-select"
                  className="font-semibold text-slate-600 mb-2 flex items-center gap-2"
                >
                  <FiPlusCircle />
                  Add Participant
                </label>
                <select
                  id="add-user-select"
                  onChange={handleAddUser}
                  className="w-full p-2 mt-1 rounded-lg bg-slate-100 border-slate-200 text-slate-800 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink transition"
                >
                  <option value="">Select user to add...</option>
                  {usersToAdd?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default GroupInfoModal;
