import React, { useState, useRef, useEffect } from "react";
import { Dialog, Switch } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfileApi } from "../../api/user";
import { setCredentials } from "../../features/authSlice";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { FiEdit2, FiSettings, FiMoon, FiSun } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

const SettingsModal = ({ isOpen, setIsOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { status: userInfo?.status || "" },
  });

  useEffect(() => {
    if (isOpen && userInfo) {
      setValue("status", userInfo.status);
      setImagePreview(userInfo.profilePicture);
      setImageFile(null);
    }
  }, [isOpen, userInfo, setValue]);

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: updateUserProfileApi,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Profile updated successfully!");
      closeModal();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update profile."),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const closeModal = () => setIsOpen(false);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("status", data.status);
    if (imageFile) formData.append("profilePicture", imageFile);
    updateUser(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-bold text-card-foreground flex items-center gap-3">
                    <FiSettings /> Profile Settings
                  </Dialog.Title>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="p-2 text-muted-foreground hover:text-rose-500 rounded-full hover:bg-rose-500/10"
                  >
                    <IoClose size={24} />
                  </motion.button>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-card-foreground">
                      {theme === "light" ? <FiSun /> : <FiMoon />}
                      <span className="text-sm font-medium">
                        {theme === "light" ? "Light Mode" : "Dark Mode"}
                      </span>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                      className={`${
                        theme === "dark" ? "bg-primary" : "bg-muted"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${
                          theme === "dark" ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <img
                        src={
                          imagePreview ||
                          `https://api.dicebear.com/8.x/lorelei/svg?seed=${userInfo?.username}`
                        }
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover bg-muted ring-4 ring-background shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                    <div className="w-full text-center">
                      <h3 className="text-xl font-bold text-card-foreground">
                        {userInfo?.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userInfo?.email}
                      </p>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-muted-foreground"
                      >
                        Status
                      </label>
                      <input
                        type="text"
                        id="status"
                        {...register("status")}
                        className="mt-1 block w-full rounded-lg bg-input border-border text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring p-2 transition"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                    >
                      {isPending ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                </form>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
