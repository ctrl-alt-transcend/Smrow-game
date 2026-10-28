import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { socket } from '../../socket.tsx';
import type { GameDataDto } from "@shared/game/game.types.ts";

export function useGameState() : { game: GameDataDto | null; } {
  const [game, setGame] = useState< GameDataDto | null>(null); //INFO: game is the state variable that will hold the game state, and setGame is the function that will update it.
  let navigate = useNavigate();

  useEffect(() => {
    const onConnect = async () => {
      try {
        const response = await socket.timeout(5000).emitWithAck('joinRoom');
        console.log('[joinRoom] ack =', response);
        if (response?.ok && response.data) setGame(response.data);
        else {
          console.warn('[joinRoom] refused:', response?.error);
          navigate('/home');
          return ;
        }
      } catch (err) {
        console.error('[joinRoom] no ack (timeout / disconnect):', err);
        navigate('/home');
        return ;
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
      socket.off('gameState', setGame); //INFO: unsubscribe from the gameState event
      socket.disconnect(); //INFO: disconnect the socket
    };
  }, [navigate]); //INFO: [] means that the effect will only run once, when the component mounts.


  return { game };
}
