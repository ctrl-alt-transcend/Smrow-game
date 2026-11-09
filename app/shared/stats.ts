// ----- Write contract -----
// What the game must provide once a game is over.
// See StatsService.recordGameResult in the backend.

export type GameResultPlayer = {
  userId: string;
  turnOrder: number;
  winPoints: number;
  isWinner: boolean;
  playerRank: number;
  settlementBuilt: number;
  citiesBuilt: number;
  devCardsBought: number;
};

export type GameResult = {
  totalTurns: number;
  duration?: number; // seconds
  playedAt?: string; // ISO date, defaults to now
  players: GameResultPlayer[];
};

// ----- Read responses -----

export type Achievement = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  progress: number; // current value
  goal: number; // value needed to unlock
};

export type PlayerLevel = {
  level: number;
  xp: number;
  currentLevelXp: number; // xp needed to reach the current level
  nextLevelXp: number; // xp needed to reach the next level
};

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // 0 to 100
  averageRank: number | null;
  totalWinPoints: number;
  totalSettlements: number;
  totalCities: number;
  totalDevCards: number;
  level: PlayerLevel;
  achievements: Achievement[];
};

export type MatchOpponent = {
  userId: string;
  username: string;
  playerRank: number;
  isWinner: boolean;
};

export type MatchHistoryEntry = {
  gameId: string;
  playedAt: string;
  duration: number | null;
  totalTurns: number;
  isWinner: boolean;
  playerRank: number;
  winPoints: number;
  opponents: MatchOpponent[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarURL: string | null;
  wins: number;
  gamesPlayed: number;
  winRate: number; // 0 to 100
};
