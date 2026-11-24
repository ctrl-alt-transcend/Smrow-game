import { useEffect, useState } from "react";
import { spectateSocket as socket } from "../../sockets/spectateSocket.tsx";
import type { GameDataDto } from "shared";

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
          return;
        }
      } catch (err) {
        console.error(err);
        return;
      }
    };

    const onConnectError = (err: Error) =>
      console.error("[spectate] connect_error:", err);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("spectate:update", setGame);

    if (socket.connected) void onConnect();
    else socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("spectate:update", setGame);
      socket.disconnect();
    };
  }, [gameId]);

  return { game };
}
