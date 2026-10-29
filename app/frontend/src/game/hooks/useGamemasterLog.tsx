// import { useCallback, useEffect, useRef, useState } from 'react';
// import axios from 'axios';
//
// interface GreetingResponse {
//   message: string;
// }
//
// export function useGamemasterLog(initialUrl: string | null) {
//   const [data, setData] = useState<string>('');
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const abortRef = useRef<AbortController | null>(null);
//
//   const refetch = useCallback(
//     async (url?: string): Promise<string | null> => {
//     const targetUrl = url ?? initialUrl;
//     if (!targetUrl) return null;
//
//     abortRef.current?.abort();
//     const ac = new AbortController();
//     abortRef.current = ac;
//
//     setLoading(true);
//     setError(null);
//
//     try {
//       const response = await axios.get<GreetingResponse>(targetUrl, {
//         signal: ac.signal,
//       });
//       const message =
//         typeof response.data === 'string' ? response.data : response.data.message;
//       setData(message);
//       return message;
//     } catch (err) {
//       if (axios.isCancel(err)) return null;
//       setError(axios.isAxiosError(err) ? err.message : 'Erreur inconnue');
//       return null;
//     } finally {
//       if (!ac.signal.aborted) setLoading(false);
//     }
//   }, [initialUrl]);
//
//   useEffect(() => {
//     if (initialUrl) void refetch(initialUrl);
//     return () => abortRef.current?.abort();
//   }, [refetch, initialUrl]);
//
//   return { data, error, loading, refetch };
// }
