import axios from "axios";
import { KEY } from "../config/config";
import { authEvents } from "../context/AuthEvents";

// withCredentials, allows axios to automatically include cookies with every request

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isAuthRoute = [
      "auth/me",
      "auth/login",
      "auth/register",
      "auth/logout",
    ].some((path) => url.includes(path));

    if (error.response?.status === 401 && !isAuthRoute) {
      authEvents.dispatchEvent(
        new CustomEvent("logout", {
          detail: "You session has expired.",
        }),
      );
    }
    return Promise.reject(error);
  },
);
