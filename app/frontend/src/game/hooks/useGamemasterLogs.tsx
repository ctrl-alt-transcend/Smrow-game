import { useState, useEffect } from "react"
import axios from 'axios';

interface Response {
  message: string;
}

export default function useGamemasterLogs(controller: string) {
  const [data, setData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Response>(controller, {
          signal: abortController.signal,
        });
        setData(response.data.message);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(axios.isAxiosError(err) ? err.message : 'Unkown error');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, [controller]);

  return { data, error, loading };
}