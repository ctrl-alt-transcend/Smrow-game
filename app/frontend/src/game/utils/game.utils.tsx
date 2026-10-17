import { createRoom, joinRoom } from './game.ws.tsx'
import { useNavigate } from "react-router";

export function useCreateLobby() {
  const navigate = useNavigate();

  return async function createLobby() {
    await createRoom();
    navigate('/game');
  };
}

export function useJoinLobby() {
  const navigate = useNavigate();

  return async function joinLobby(gameId: string) {
    await joinRoom(gameId);
    navigate('/game');
  };
}
