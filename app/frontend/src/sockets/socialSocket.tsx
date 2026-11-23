import { io } from "socket.io-client";

export const socialSocket = io("/social", {
  path: "/ws",
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") ?? "" }),
});

socialSocket.on("connect_error", (err) => {
  console.warn("[socialSocket] connect_error:", err);
});
