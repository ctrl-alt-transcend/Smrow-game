import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

console.log("connecting to the server...");

socket.on("connect", () => {
  console.log("Connected to the server");
  socket.emit("message", "Hello from the client!", (response) => {
    console.log("Response: ", response);
  });
});

