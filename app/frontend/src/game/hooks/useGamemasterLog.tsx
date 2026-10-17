import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface GreetingResponse {
  message: string;
}

export function useGamemasterLog(controller: string) {
  const [data, setData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);


  const refetch = useCallback(async (): Promise<string | null> => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<GreetingResponse>(controller, {
        signal: ac.signal,
      });
      const message =
        typeof response.data === 'string' ? response.data : response.data.message;
      setData(message);
      return message;
    } catch (err) {
      if (axios.isCancel(err)) return null;
      setError(axios.isAxiosError(err) ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [controller]);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { data, error, loading, refetch };
}