import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * @desc    Creates a new group chat
 * @param   {object} groupData - Contains { name: string, users: stringified_array }
 * @returns {object} The new group conversation object
 */
export const createGroupChatApi = async (groupData) => {
  const { data } = await axiosInstance.post("/groups", groupData);
  return data;
};

/**
 * @desc    Updates a group's name and/or icon
 * @param   {FormData} formData - Contains conversationId, groupName, and optional groupIcon file
 * @returns {object} The updated group conversation object
 */
export const renameGroupApi = async (formData) => {
  const { data } = await axiosInstance.put("/groups/rename", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

/**
 * @desc    Adds a user to a group
 * @param   {object} data - Contains { conversationId, userId }
 * @returns {object} The updated group conversation object
 */
export const addToGroupApi = async ({ conversationId, userId }) => {
  const { data } = await axiosInstance.put("/groups/add", {
    conversationId,
    userId,
  });
  return data;
};

/**
 * @desc    Removes a user from a group
 * @param   {object} data - Contains { conversationId, userId }
 * @returns {object} The updated group conversation object
 */
export const removeFromGroupApi = async ({ conversationId, userId }) => {
  const { data } = await axiosInstance.put("/groups/remove", {
    conversationId,
    userId,
  });
  return data;
};
