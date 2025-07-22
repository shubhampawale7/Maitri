import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getStoriesApi } from "../../api/stories";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";

const StoryTray = ({ onStoryClick, onAddStoryClick }) => {
  const { data: storyGroups, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: getStoriesApi,
  });

  return (
    <div className="p-4 border-b border-slate-200">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-thin pb-2">
        <div className="text-center flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddStoryClick}
            className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center"
          >
            <FiPlus className="text-slate-500" size={24} />
          </motion.button>
          <p className="text-xs mt-1 font-medium text-slate-600">Your Story</p>
        </div>

        {isLoading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="text-center flex-shrink-0 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-slate-200"></div>
              <div className="h-2 w-12 bg-slate-200 rounded-full mt-2 mx-auto"></div>
            </div>
          ))}

        {storyGroups?.map((group, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={group.author._id}
            onClick={() => onStoryClick(index)}
            className="text-center flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-pink to-brand-orange p-1 transition-transform group-hover:scale-105">
              <div className="bg-white p-0.5 rounded-full">
                <img
                  src={
                    group.author.profilePicture ||
                    `https://api.dicebear.com/8.x/lorelei/svg?seed=${group.author.username}`
                  }
                  alt={group.author.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <p className="text-xs mt-1 font-medium text-slate-600 truncate w-16">
              {group.author.username}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StoryTray;
