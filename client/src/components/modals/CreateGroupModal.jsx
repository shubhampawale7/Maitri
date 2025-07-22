import React, { useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getUsersApi } from "../../api/auth";
import { createGroupChatApi } from "../../api/groups";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiUsers } from "react-icons/fi";

// --- Skeleton loader updated for the light theme ---
const UserSkeleton = () => (
  <div className="space-y-3 p-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 animate-pulse">
        <div className="w-5 h-5 rounded bg-slate-200"></div>
        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const CreateGroupModal = ({ isOpen, setIsOpen }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  const { mutate: createGroup, isPending } = useMutation({
    mutationFn: createGroupChatApi,
    onSuccess: () => {
      toast.success("Group created successfully!");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      closeModal();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to create group."),
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      reset();
      setSelectedUsers([]);
      setSearchTerm("");
    }, 300); // Allow exit animation to complete
  };

  const onSubmit = (data) => {
    if (selectedUsers.length < 2) {
      return toast.error("Please select at least 2 users.");
    }
    createGroup({
      name: data.groupName,
      users: JSON.stringify(selectedUsers),
    });
  };

  const filteredUsers = useMemo(
    () =>
      users?.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
      {/* --- Backdrop --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FiUsers />
              Create New Group
            </Dialog.Title>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-col space-y-4"
            >
              <input
                type="text"
                placeholder="Group Name"
                {...register("groupName", { required: true })}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink text-slate-800 transition"
              />

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink text-slate-800 transition"
                />
              </div>

              <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                <p className="text-sm font-bold text-slate-500 mb-2">
                  Select Members:
                </p>
                {isLoading ? (
                  <UserSkeleton />
                ) : (
                  <AnimatePresence>
                    {filteredUsers?.map((user) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={user._id}
                        onClick={() => handleUserSelect(user._id)}
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.includes(user._id)
                            ? "bg-brand-pink/10"
                            : "hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`user-select-${user._id}`}
                          readOnly
                          checked={selectedUsers.includes(user._id)}
                          className="h-5 w-5 rounded-md border-slate-300 text-brand-pink focus:ring-brand-pink cursor-pointer"
                        />
                        <img
                          src={
                            user.profilePicture ||
                            `https://api.dicebear.com/8.x/lorelei/svg?seed=${user.username}`
                          }
                          alt={user.username}
                          className="w-8 h-8 rounded-full ml-3 object-cover"
                        />
                        <label
                          htmlFor={`user-select-${user._id}`}
                          className="ml-3 text-slate-800 cursor-pointer"
                        >
                          {user.username}
                        </label>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-500">
                  {selectedUsers.length} selected
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-br from-brand-pink to-brand-orange rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                >
                  {isPending ? "Creating..." : "Create Group"}
                </motion.button>
              </div>
            </form>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default CreateGroupModal;
