import React, { useState, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createStoryApi } from "../../api/stories";
import { FiUploadCloud } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";

const AddStoryModal = ({ isOpen, setIsOpen }) => {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutate: createStory, isPending } = useMutation({
    mutationFn: createStoryApi,
    onSuccess: () => {
      toast.success("Story posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      closeModal();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to post story."),
  });

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMediaFile(null);
      setMediaPreview(null);
    }, 300);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!mediaFile) return toast.error("Please select an image or video.");
    const formData = new FormData();
    formData.append("media", mediaFile);
    createStory(formData);
  };

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
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
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="text-2xl font-bold text-slate-900">
              Add to your Story
            </Dialog.Title>
            <div className="mt-6">
              {mediaPreview ? (
                <div className="w-full h-80 rounded-lg bg-slate-100 flex items-center justify-center">
                  {mediaFile.type.startsWith("image/") ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      muted
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-80 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <FiUploadCloud size={48} />
                  <p className="mt-2 font-semibold">Click to upload media</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/mp4,video/webm"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
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
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !mediaFile}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-br from-brand-pink to-brand-orange rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
              >
                {isPending ? (
                  <CgSpinner className="animate-spin" size={20} />
                ) : (
                  "Post Story"
                )}
              </motion.button>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
};
export default AddStoryModal;
