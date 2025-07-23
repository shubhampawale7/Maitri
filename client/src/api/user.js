import axiosInstance from "./index.js";

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
