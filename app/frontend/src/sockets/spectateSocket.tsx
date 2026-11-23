import { io } from "socket.io-client";

export const spectateSocket = io("/spectate", {
  path: "/ws",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});
