import { io } from "socket.io-client";
import { logoutOnError } from "./logoutOnError";

export const gameSocket = io("/game", {
  path: "/ws",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});

gameSocket.on("connect_error", logoutOnError);
