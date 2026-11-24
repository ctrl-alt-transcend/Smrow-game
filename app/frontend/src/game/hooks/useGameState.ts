import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { gameSocket as socket } from "../../sockets/gameSocket.tsx";
import type { GameDataDto } from "shared";

export function useGameState(): { game: GameDataDto | null } {
  const [game, setGame] = useState<GameDataDto | null>(null); //INFO: game is the state variable that will hold the game state, and setGame is the function that will update it.

  let navigate = useNavigate();

  useEffect(() => {
    const onConnect = async () => {
      try {
        const response = await socket.timeout(5000).emitWithAck("game:join");
        if (response?.ok && response.data) setGame(response.data);
        else {
          navigate("/home");
          return;
        }
      } catch (err) {
        console.error(err);
        navigate("/home");
        return;
      }
    };

    const onDisconnect = (reason: string) => {
      if (reason === "io server disconnect") {
        navigate("/home");
      }
    };

    const onConnectError = (err: Error) =>
      console.error("[socket] connect_error:", err);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("game:state", setGame);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) void onConnect();
    else socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("game:state", setGame); //INFO: unsubscribe from the gameState event
      socket.off("disconnect", onDisconnect);
      socket.disconnect(); //INFO: disconnect the socket
    };
  }, [navigate]); //INFO: [] means that the effect will only run once, when the component mounts.

  return { game };
}
