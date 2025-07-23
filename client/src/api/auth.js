import axiosInstance from "./index.js";

export const registerUserApi = async (userData) => {
  const { data } = await axiosInstance.post("/users", userData);
  return data;
};

export const loginUserApi = async (userData) => {
  const { data } = await axiosInstance.post("/users/login", userData);
  return data;
};

export const logoutUserApi = async () => {
  const { data } = await axiosInstance.post("/users/logout");
  return data;
};
