import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const StoryViewer = ({ storyGroups, initialGroupIndex, onClose }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  const activeGroup = storyGroups[currentGroupIndex];
  const activeStory = activeGroup?.stories[currentStoryIndex];

  useEffect(() => {
    if (isPaused) return; // Don't auto-advance if paused

    const storyDuration =
      activeStory?.mediaType === "video"
        ? videoRef.current?.duration * 1000 || 5000
        : 5000;
    const timer = setTimeout(() => handleNextStory(), storyDuration);

    return () => clearTimeout(timer);
  }, [currentStoryIndex, currentGroupIndex, isPaused]);

  const handleNextStory = () => {
    if (currentStoryIndex < activeGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentGroupIndex > 0) {
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentGroupIndex(currentGroupIndex - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
    }
  };

  if (!activeStory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full h-full max-w-md max-h-[95vh] rounded-lg">
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          {activeGroup.stories.map((_, idx) => (
            <div
              key={idx}
              className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden"
            >
              {idx < currentStoryIndex && (
                <div className="h-full bg-white"></div>
              )}
              {idx === currentStoryIndex && (
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={
                    isPaused
                      ? {
                          width: videoRef.current
                            ? `${
                                (videoRef.current.currentTime /
                                  videoRef.current.duration) *
                                100
                              }%`
                            : "0%",
                        }
                      : { width: "100%" }
                  }
                  transition={{
                    duration: isPaused
                      ? 0
                      : activeStory?.mediaType === "video"
                      ? videoRef.current?.duration -
                          videoRef.current?.currentTime || 5
                      : 5,
                    ease: "linear",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-5 left-4 flex items-center gap-3 z-20">
          <img
            src={
              activeGroup.author.profilePicture ||
              `https://api.dicebear.com/8.x/lorelei/svg?seed=${activeGroup.author.username}`
            }
            alt={activeGroup.author.username}
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="text-white font-bold drop-shadow-md">
            {activeGroup.author.username}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white z-20 p-2 drop-shadow-lg"
        >
          <IoClose size={28} />
        </motion.button>
        <button
          onClick={handlePrevStory}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
        ></button>
        <button
          onClick={handleNextStory}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
        ></button>

        <div className="w-full h-full flex items-center justify-center">
          <AnimatePresence>
            <motion.div
              key={activeStory._id}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {activeStory.mediaType === "image" ? (
                <img
                  src={activeStory.mediaUrl}
                  alt="Story content"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={activeStory.mediaUrl}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleNextStory}
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryViewer;
