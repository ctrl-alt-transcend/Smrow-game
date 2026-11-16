import { http } from "./http";
import type { LeaderboardEntry, MatchHistoryEntry, PlayerStats } from "shared";

export const getMyStats = async (): Promise<PlayerStats> => {
  const res = await http.get<PlayerStats>("/stats/me");
  return res.data;
};

export const getMyMatchHistory = async (
  limit = 20,
): Promise<MatchHistoryEntry[]> => {
  const res = await http.get<MatchHistoryEntry[]>("/stats/me/history", {
    params: { limit },
  });
  return res.data;
};

export const getLeaderboard = async (
  limit = 10,
): Promise<LeaderboardEntry[]> => {
  const res = await http.get<LeaderboardEntry[]>("/stats/leaderboard", {
    params: { limit },
  });
  return res.data;
};
