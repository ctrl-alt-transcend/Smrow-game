import type { Achievement, PlayerLevel } from 'shared';

/**
 * @brief: Level and achievements are computed from the recorded games,
 *         nothing is stored. Tune the values here, every player is updated
 *         on the next read.
 */

export type StatsTotals = {
  gamesPlayed: number;
  wins: number;
  totalWinPoints: number;
  totalSettlements: number;
  totalCities: number;
  totalDevCards: number;
};

const XP_PER_GAME = 10;
const XP_PER_WIN = 50;
const XP_PER_WIN_POINT = 5;

/** xp needed to reach a level: 0, 100, 300, 600, 1000... */
export const xpForLevel = (level: number) => 50 * level * (level - 1);

export function computeLevel(totals: StatsTotals): PlayerLevel {
  const xp =
    totals.gamesPlayed * XP_PER_GAME +
    totals.wins * XP_PER_WIN +
    totals.totalWinPoints * XP_PER_WIN_POINT;

  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;

  return {
    level,
    xp,
    currentLevelXp: xpForLevel(level),
    nextLevelXp: xpForLevel(level + 1),
  };
}

type AchievementRule = Omit<Achievement, 'unlocked' | 'progress'> & {
  value: (totals: StatsTotals) => number;
};

export const ACHIEVEMENTS: AchievementRule[] = [
  {
    id: 'first-game',
    label: 'First steps',
    description: 'Play your first game',
    goal: 1,
    value: (t) => t.gamesPlayed,
  },
  {
    id: 'first-win',
    label: 'First victory',
    description: 'Win a game',
    goal: 1,
    value: (t) => t.wins,
  },
  {
    id: 'veteran',
    label: 'Veteran',
    description: 'Play 10 games',
    goal: 10,
    value: (t) => t.gamesPlayed,
  },
  {
    id: 'champion',
    label: 'Champion',
    description: 'Win 10 games',
    goal: 10,
    value: (t) => t.wins,
  },
  {
    id: 'settler',
    label: 'Settler',
    description: 'Build 25 settlements',
    goal: 25,
    value: (t) => t.totalSettlements,
  },
  {
    id: 'city-planner',
    label: 'City planner',
    description: 'Build 10 cities',
    goal: 10,
    value: (t) => t.totalCities,
  },
];

export function computeAchievements(totals: StatsTotals): Achievement[] {
  return ACHIEVEMENTS.map(({ value, ...rule }) => {
    const current = value(totals);
    return {
      ...rule,
      unlocked: current >= rule.goal,
      progress: Math.min(current, rule.goal),
    };
  });
}

export const winRate = (wins: number, gamesPlayed: number) =>
  gamesPlayed === 0 ? 0 : Math.round((wins / gamesPlayed) * 100);
