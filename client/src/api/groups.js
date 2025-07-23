  import axiosInstance from "./index.js";

export const createGroupChatApi = async (groupData) => {
  const { data } = await axiosInstance.post("/groups", groupData);
  return data;
};

export const renameGroupApi = async (formData) => {
  const { data } = await axiosInstance.put("/groups/rename", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const addToGroupApi = async ({ conversationId, userId }) => {
  const { data } = await axiosInstance.put("/groups/add", {
    conversationId,
    userId,
  });
  return data;
};

export const removeFromGroupApi = async ({ conversationId, userId }) => {
  const { data } = await axiosInstance.put("/groups/remove", {
    conversationId,
    userId,
  });
  return data;
};
