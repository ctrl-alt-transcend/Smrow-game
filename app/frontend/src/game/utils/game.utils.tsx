import { useNavigate } from "react-router";
import { getUserToken } from "../../services/user.service.tsx";
import axios from "axios";
import { SettingsDataSchema, type SettingsData } from "shared";
import { z } from "zod";

export function useCreateLobby() {
  const navigate = useNavigate();

  return async function createLobby(values: SettingsData) {
    const parsed = SettingsDataSchema.safeParse(values);
    if (!parsed.success) {
      console.error("Invalid settings:", z.treeifyError(parsed.error));
      return;
    }
    try {
      await axios.post("/api/game/create", parsed.data, {
        headers: { Authorization: `Bearer ${getUserToken()}` },
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/");
        return;
      }
      console.log("User already in a game");
      navigate("/game");
      return;
    }
    console.log("Game created successfully");
    navigate("/game");
  };
}

export function useJoinLobby() {
  const navigate = useNavigate();

  return async function joinLobby(gameId: string) {
    try {
      await axios.post(
        "/api/game/join",
        { gameId },
        {
          //INFO: { gameId } is shorthand for { gameId: gameId } if the key and the variable have the same name
          headers: { Authorization: `Bearer ${getUserToken()}` },
        },
      );
    } catch {
      navigate("/error");
    }

    navigate("/game");
  };
}
