import { io } from "socket.io-client";
import { logoutOnError } from "./logoutOnError";

export const socialSocket = io("/social", {
  path: "/ws",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});

socialSocket.on("connect_error", logoutOnError);
