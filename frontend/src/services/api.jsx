import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    if (status === 403) {
      return Promise.reject(
        new Error("You do not have permission to perform this action.")
      );
    }

    if (status === 429) {
      return Promise.reject(
        new Error("Too many requests. Please slow down and try again.")
      );
    }

    if (status >= 500) {
      return Promise.reject(
        new Error("A server error occurred. Please try again later.")
      );
    }

    return Promise.reject(error);
  }
);

export default api;