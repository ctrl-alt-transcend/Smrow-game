import { useCallback, useRef } from 'react';
import { socket } from '../../socket';
//import type { GameResponse } from '@shared/game/game.types.ts';

export function useRollDice() {
  const abortRef = useRef<AbortController | null>(null);

  const roll = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac; //OPTIM: Do you still need the signals, given that they don’t seem to be used any more ?
    socket.emit('dice');
    // const response: RollResponse = await socket.emitWithAck('rollDice');
    // return response; //TODO: remove the response and set the result in gameState

    //try {
    //  const response = await axios.post<RollResponse>(
    //    '/api/game/dice/roll',
    //    {},
    //    { signal: ac.signal }
    //  );
    //  return response.data;
    //} catch (err) {
    //  if (axios.isCancel(err)) return null;
    //  throw err;
    //}
  }, []);

  return { roll };
}
