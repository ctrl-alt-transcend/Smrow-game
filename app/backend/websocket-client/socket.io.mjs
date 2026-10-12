import { io } from "socket.io-client";

const socket = io("https://localhost:3001");

socket.on("connect", () => {
  console.log("Connected to the server");
});
