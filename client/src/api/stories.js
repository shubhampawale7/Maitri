import axios from "axios";

const API_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getStoriesApi = async () => {
  const { data } = await axiosInstance.get("/stories");
  return data;
};

export const createStoryApi = async (formData) => {
  const { data } = await axiosInstance.post("/stories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
