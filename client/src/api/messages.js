import axiosInstance from "./index.js";

export const getMessagesApi = async (conversationId) => {
  const { data } = await axiosInstance.get(`/messages/${conversationId}`);
  return data;
};

export const sendMessageApi = async (formData) => {
  const conversationId = formData.get("conversationId");
  const { data } = await axiosInstance.post(
    `/messages/send/${conversationId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const deleteMessageApi = async (messageId) => {
  const { data } = await axiosInstance.delete(`/messages/${messageId}`);
  return data;
};
