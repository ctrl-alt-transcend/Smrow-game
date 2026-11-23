import { io } from "socket.io-client";

export const gameSocket = io("/game", {
  path: "/ws",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});
