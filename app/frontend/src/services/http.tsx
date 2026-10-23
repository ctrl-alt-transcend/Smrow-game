import axios from "axios";
import { authEvents } from "../context/AuthEvents";

export const http = axios.create({
  baseURL: "/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const token = localStorage.getItem("access_token");
    if (error.response?.status === 401 && token) {
      localStorage.removeItem("access_token");
      authEvents.dispatchEvent(
      new CustomEvent("logout", {
        detail: "You session has expired.",
      }),
    );
    }
    return Promise.reject(error);
  },
);
