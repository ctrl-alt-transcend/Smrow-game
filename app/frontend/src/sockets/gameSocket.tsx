import { io } from "socket.io-client";

export const gameSocket = io({
  path: "/ws/game",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});
