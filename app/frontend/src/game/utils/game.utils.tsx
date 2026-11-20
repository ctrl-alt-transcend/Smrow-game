import { useNavigate } from "react-router";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { SettingsDataSchema, type SettingsData } from "shared";
import { z } from "zod";
import { http } from "../../services/http.tsx";

export function useCreateLobby() {
  const navigate = useNavigate();

  return async function createLobby(values: SettingsData) {
    const parsed = SettingsDataSchema.safeParse(values);
    if (!parsed.success) {
      console.error("Invalid settings:", z.treeifyError(parsed.error));
      return;
    }
    try {
      await http.post("/game/create", parsed.data);
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
      await http.post("/game/join", { gameId });
      navigate("/game");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/");
        return;
      } else if (axios.isAxiosError(error) && error.response?.status === 409) {
        navigate("/game");
        return;
      } else {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        notifications.show({
          title: "Could not join the game",
          message:
            typeof message === "string" ? message : "Please try again later.",
          color: "red",
        });
      }
    }
  };
}
