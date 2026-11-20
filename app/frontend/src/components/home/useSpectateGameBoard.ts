import { useEffect, useState } from "react";
import { gameSocket as socket } from "../../sockets/gameSocket.tsx";
import type { GameDataDto } from "shared";

export function useSpectateGameBoard(gameId: string): { game: GameDataDto | null } {
  const [game, setGame] = useState<GameDataDto | null>(null); //INFO: game is the state variable that will hold the game state, and setGame is the function that will update it.

  useEffect(() => {
    const onConnect = async () => {
      try {
        const response = await socket.timeout(5000).emitWithAck("joinSpectate", gameId);
        console.log("[joinSpectate] ack =", response);
        if (response?.ok && response.data) setGame(response.data);
        else {
          console.warn("[joinSpectate] refused:", response?.error);
          return;
        }
      } catch (err) {
        console.error("[joinSpectate] no ack (timeout / disconnect):", err);
        return;
      }
    };

    const onConnectError = (err: Error) =>
      console.error("[socket] connect_error:", err);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("gameState", setGame);

    if (socket.connected) void onConnect();
    else socket.connect();

    return () => {
    socket.off("connect", onConnect);
    socket.off("connect_error", onConnectError);
    socket.off("gameState", setGame);
    socket.disconnect();
  };
}, [gameId]);

  return { game };
}
