import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const registerUserApi = async (userData) => {
  const { data } = await axiosInstance.post("/users", userData);
  return data;
};

export const loginUserApi = async (userData) => {
  const { data } = await axiosInstance.post("/users/login", userData);
  return data;
};

export const getUsersApi = async () => {
  const { data } = await axiosInstance.get("/users");
  return data;
};

export const logoutUserApi = async () => {
  const { data } = await axiosInstance.post("/users/logout");
  return data;
};
