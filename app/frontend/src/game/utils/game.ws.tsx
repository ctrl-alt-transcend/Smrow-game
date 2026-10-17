import { socket } from "../../socket.tsx";
import { getCurrentUser } from "../../services/user.service.tsx"
import axios from 'axios'

export async function createRoom() {
  const gameId = await axios.post('/api/game/create_game');
  const user = await getCurrentUser();
  socket.emit("JoinRoom", {roomId: gameId, playerId: user.id});
  console.log("Room created with id: ", gameId);
  socket.on("message", (message) => {
    console.log("Socket.io: ", message)
  });

  //TODO: add a ACK check
}

export async function joinRoom(gameId: string) {
  console.log("Connecting to socket...");
  const user = await getCurrentUser();
  socket.emit("JoinRoom", {roomId: gameId, playerId: user.id});
  socket.on("message", (message) => {
    console.log("Socket.io: ", message)
  });
}
