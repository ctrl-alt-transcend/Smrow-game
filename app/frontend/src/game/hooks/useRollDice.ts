import { useCallback, useRef } from 'react';
import axios from 'axios';
import { DiceValue } from '../components/gameboard/Dice/Dice';
import { GameResponse } from '../../../../shared/game/game.types';


export function useRollDice() {
  const abortRef = useRef<AbortController | null>(null);

  const roll = useCallback(async (): Promise<GameResponse | null> => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const response = await axios.post<GameResponse>(
        '/api/game/dice',
        {},
        { signal: ac.signal }
      );
      return response.data;
    } catch (err) {
      if (axios.isCancel(err)) return null;
      throw err;
    }
  }, []);

  return { roll };
}
