import { useEffect, useState } from "react";
import { spectateSocket as socket } from "../../sockets/spectateSocket.tsx";
import type { GameDataDto } from "shared";
import { notifications } from "@mantine/notifications";

export function useSpectateGameBoard(gameId: string): {
  game: GameDataDto | null;
} {
  const [game, setGame] = useState<GameDataDto | null>(null);

  useEffect(() => {
    const onConnect = async () => {
      try {
        const response = await socket
          .timeout(5000)
          .emitWithAck("spectate:join", gameId);
        if (response?.ok && response.data) setGame(response.data);
        else {
          notifications.show({
            title: "No game",
            message: "the game does not exist.",
            color: "yellow",
          });
          return;
        }
      } catch {
        notifications.show({
          title: "Server error",
          message: `Could not join the game. Please try again later.`,
          color: "red",
        });
        return;
      }
    };

    socket.on("connect", onConnect);
    socket.on("spectate:update", setGame);

    if (socket.connected) void onConnect();
    else socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("spectate:update", setGame);
      socket.disconnect();
    };
  }, [gameId]);

  return { game };
}
