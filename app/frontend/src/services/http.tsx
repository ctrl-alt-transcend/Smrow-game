import axios from "axios";
import { KEY } from "../config/config"
import { authEvents } from "../context/AuthEvents";

export const http = axios.create({
  baseURL: "/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const token = localStorage.getItem(KEY.ACCESS_TOKEN);
    if (error.response?.status === 401 && token) {
      localStorage.removeItem(KEY.ACCESS_TOKEN);
      authEvents.dispatchEvent(
        new CustomEvent("logout", {
          detail: "You session has expired.",
        }),
      );
    }
    return Promise.reject(error);
  },
);
