import axios from "axios";
import { authEvents } from "../context/AuthEvents";

export const http = axios.create({
    baseURL: "http://localhost:8000",
});

http.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            authEvents.dispatchEvent(new CustomEvent("logout", {
                detail: "Votre session a expiré, veuillez vous reconnecter",
            }));
        }
        return Promise.reject(error);
    }
);