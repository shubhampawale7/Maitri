import axiosInstance from "./index.js";

export const getStoriesApi = async () => {
  const { data } = await axiosInstance.get("/stories");
  return data;
};

export const createStoryApi = async (formData) => {
  const { data } = await axiosInstance.post("/stories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
