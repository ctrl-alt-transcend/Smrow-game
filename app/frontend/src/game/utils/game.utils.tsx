import { useNavigate } from "react-router";
import axios from "axios";
import { http } from "../../services/http.tsx";

export function useCreateLobby() {
  const navigate = useNavigate();

  return async function createLobby() {
    try {
      await http.post("/game/create");
      navigate("/game");
      console.log("Game created succesfully");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/");
        return;
      }
      console.log("User already in a game");
      navigate("/game");
      return;
    }
  };
}

export function useJoinLobby() {
  const navigate = useNavigate();

  return async function joinLobby(gameId: string) {
    try {
      await http.post("/api/game/join", { gameId });
    } catch {
      navigate("/error");
    }
    navigate("/game");
  };
}
