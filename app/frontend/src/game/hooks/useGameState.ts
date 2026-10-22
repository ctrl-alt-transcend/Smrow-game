import { useEffect, useState } from 'react';
import { socket } from '../../socket.tsx';
import type { GameState } from  "../../../../shared/game/game.types.ts"

export function useGameState() {
  const [game, setGame] = useState<GameState | null>(null); //INFO: game is the state variable that will hold the game state, and setGame is the function that will update it.
  //const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onConnect = async() => {
      const response = await socket.timeout(5000).emitWithAck('joinRoom');
      setGame(response.data);
    };

  socket.auth = {token: localStorage.getItem("access_token")}; //TODO: setError if no token is found
  socket.on('connect', onConnect);
  socket.on("gameState", setGame)
  socket.connect();

  return () => {
    socket.off('connect', onConnect);
    socket.off("gameState", setGame); //INFO: unsubscribe from the gameState event
    socket.disconnect(); //INFO: disconnect the socket
  }

  }, []); //INFO: [] means that the effect will only run once, when the component mounts.

  return { game };
}
