import { io } from "socket.io-client";
import { logoutOnError } from "./logoutOnError";

export const spectateSocket = io("/spectate", {
  path: "/ws",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});

spectateSocket.on("connect_error", logoutOnError);
