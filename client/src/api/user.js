import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getUserProfileApi = async () => {
  const { data } = await axiosInstance.get("/users/profile");
  return data;
};

export const updateUserProfileApi = async (formData) => {
  const { data } = await axiosInstance.put("/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
export const searchUsersApi = async (searchTerm) => {
  const { data } = await axiosInstance.get(`/users?search=${searchTerm}`);
  return data;
};
