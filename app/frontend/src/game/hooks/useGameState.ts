import { useEffect, useState } from 'react';
import { socket } from '../../socket.tsx';
//import type { GameState } from  "@shared/game/game.types.ts";
import type { GameData } from "@shared/game/game.types.ts";

export function useGameState() : GameData | null {
//  //const [game, setGame] = useState<GameState | null>(null); //INFO: game is the state variable that will hold the game state, and setGame is the function that will update it.
  const [game, setGame] = useState< GameData | null>(null); //INFO: game is the state variable that will hold the game state, and setGame is the function that will update it.
//  //const [error, setError] = useState<string | null>(null);

//  useEffect(() => {
//    const onConnect = async() => {
//      const response = await socket.timeout(5000).emitWithAck('joinRoom');
//      setGame(response.data);
//    };

//  socket.auth = {token: localStorage.getItem("access_token")}; //TODO: setError if no token is found
//  socket.on('connect', onConnect);
//  socket.on("gameState", setGame);
//  socket.connect();

//  return () => {
//    socket.off('connect', onConnect);
//    socket.off("gameState", setGame); //INFO: unsubscribe from the gameState event
//    socket.disconnect(); //INFO: disconnect the socket
//  }

//  }, []); //INFO: [] means that the effect will only run once, when the component mounts.

  useEffect(() => {
    const onConnect = async () => {
      try {
        const response = await socket.timeout(5000).emitWithAck('joinRoom');
        console.log('[joinRoom] ack =', response);
        if (response?.ok && response.data) setGame(response.data);
        else console.warn('[joinRoom] refused:', response?.error);
      } catch (err) {
        console.error('[joinRoom] no ack (timeout / disconnect):', err);
      }
    };

    const onConnectError = (err: Error) => console.error('[socket] connect_error:', err);

    socket.auth = { token: localStorage.getItem('access_token') ?? '' };
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('gameState', setGame);

    if (socket.connected) void onConnect();
    else socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('gameState', setGame);
      socket.disconnect();
    };
  }, []);

  return (game);
}
