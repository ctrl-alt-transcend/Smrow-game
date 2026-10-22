import { useCallback, useRef } from 'react';
import axios from 'axios';
import type { DiceValue } from '../components/gameboard/Dice/Dice';
import type { RollResponse } from '@shared/game/game.types';


export function useRollDice() {
  const abortRef = useRef<AbortController | null>(null);

  const roll = useCallback(async (): Promise<RollResponse | null> => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const response = await axios.post<RollResponse>(
        '/api/game/dice/roll',
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
