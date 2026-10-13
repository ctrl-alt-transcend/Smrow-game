import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

console.log("connecting to the server...");
socket.on("connect", ()=> {
  console.log("Connected to the server with id: ", socket.id);

  console.log("Joining room...");
  socket.emit("joinRoom", (response) => {
    console.log("Message recevied from server: ", response);
  });

});

socket.on("message", (arg) => {
  console.log("Message recevied from server: ", arg)
});


socket.on('joinedRoom', (msg) => {
  console.log("RoomJoined :", msg);
});
