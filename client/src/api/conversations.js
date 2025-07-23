import axiosInstance from "./index.js";

export const getConversationsApi = async () => {
  const { data } = await axiosInstance.get("/conversations");
  return data;
};
