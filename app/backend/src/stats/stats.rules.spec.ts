import {
  computeAchievements,
  computeLevel,
  StatsTotals,
  winRate,
  xpForLevel,
} from './stats.rules';

const totals = (overrides: Partial<StatsTotals> = {}): StatsTotals => ({
  gamesPlayed: 0,
  wins: 0,
  totalWinPoints: 0,
  totalSettlements: 0,
  totalCities: 0,
  totalDevCards: 0,
  ...overrides,
});

describe('stats rules', () => {
  it('starts at level 1 without games', () => {
    expect(computeLevel(totals())).toEqual({
      level: 1,
      xp: 0,
      currentLevelXp: 0,
      nextLevelXp: 100,
    });
  });

  it('levels up when reaching the threshold', () => {
    // 2 games, 1 win, 0 points -> 20 + 50 = 70xp
    expect(computeLevel(totals({ gamesPlayed: 2, wins: 1 })).level).toBe(1);
    // 5 games, 1 win, 6 points -> 50 + 50 + 30 = 130xp
    const level = computeLevel(
      totals({ gamesPlayed: 5, wins: 1, totalWinPoints: 6 }),
    );
    expect(level.level).toBe(2);
    expect(level.currentLevelXp).toBe(xpForLevel(2));
  });

  it('unlocks achievements and caps progress at the goal', () => {
    const achievements = computeAchievements(
      totals({ gamesPlayed: 12, wins: 0 }),
    );
    const byId = new Map(achievements.map((a) => [a.id, a]));

    expect(byId.get('veteran')).toMatchObject({ unlocked: true, progress: 10 });
    expect(byId.get('first-win')).toMatchObject({
      unlocked: false,
      progress: 0,
    });
  });

  it('computes win rate as a percentage', () => {
    expect(winRate(0, 0)).toBe(0);
    expect(winRate(1, 3)).toBe(33);
  });
});
