import axios from "axios";

// Define the base URL for the API. It will use the Vercel environment variable in production.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create a single, configured instance of Axios.
// All API calls will use this instance, ensuring consistency.
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for sending cookies with every request
});

export default axiosInstance;
