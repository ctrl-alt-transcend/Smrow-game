import type { Player, SettlementData } from 'shared';
import { buildGameResult } from './game.result';

const player = (
  playerId: string,
  victoryPoints: number,
  buildings: boolean[] = [], // one entry per settlement, true when upgraded
): Player =>
  ({
    playerId,
    victoryPoints,
    settlementsBuilt: new Map(
      buildings.map((isCity, i) => [
        `${playerId}-${i}`,
        { isCity } as SettlementData,
      ]),
    ),
  }) as Player;

const gameOf = (winner: string, players: Player[]) => ({
  winner,
  players: new Map(players.map((p) => [p.playerId, p])),
  turnOrder: players.map((p) => p.playerId),
});

const userIds = new Map([
  ['alice', 'u-alice'],
  ['bob', 'u-bob'],
  ['carol', 'u-carol'],
  ['dave', 'u-dave'],
]);

describe('buildGameResult', () => {
  it('ranks the winner first, then by victory points with shared ties', () => {
    const game = gameOf('bob', [
      player('alice', 6),
      player('bob', 10),
      player('carol', 8),
      player('dave', 6),
    ]);

    const { players } = buildGameResult(game, userIds, 12);
    const rankOf = (userId: string) =>
      players.find((p) => p.userId === userId)?.playerRank;

    expect(rankOf('u-bob')).toBe(1);
    expect(rankOf('u-carol')).toBe(2);
    expect(rankOf('u-alice')).toBe(3);
    expect(rankOf('u-dave')).toBe(3);
    expect(players.filter((p) => p.isWinner).map((p) => p.userId)).toEqual([
      'u-bob',
    ]);
  });

  it('never shares rank 1 with a player tied with the winner', () => {
    const game = gameOf('alice', [player('alice', 10), player('bob', 10)]);

    const { players } = buildGameResult(game, userIds, 5);

    expect(players.map((p) => [p.userId, p.playerRank])).toEqual([
      ['u-alice', 1],
      ['u-bob', 2],
    ]);
  });

  it('counts settlements, cities, turn order and rounds', () => {
    const game = gameOf('alice', [
      player('bob', 3, [false]),
      player('alice', 10, [true, true, false]),
    ]);

    const result = buildGameResult(game, userIds, 7);
    const alice = result.players.find((p) => p.userId === 'u-alice');

    expect(result.totalTurns).toBe(7);
    expect(alice).toMatchObject({
      turnOrder: 1,
      winPoints: 10,
      settlementBuilt: 3,
      citiesBuilt: 2,
      devCardsBought: 0,
    });
  });

  it('leaves out players who joined after the turn order was set', () => {
    const game = gameOf('alice', [player('alice', 10), player('bob', 5)]);
    game.turnOrder = ['alice'];

    const { players } = buildGameResult(game, userIds, 4);

    expect(players.map((p) => p.userId)).toEqual(['u-alice']);
  });

  it('leaves out players without a user id', () => {
    const game = gameOf('bot', [player('bot', 10), player('alice', 4)]);

    const { players } = buildGameResult(game, userIds, 3);

    expect(players).toHaveLength(1);
    expect(players[0]).toMatchObject({
      userId: 'u-alice',
      isWinner: false,
      playerRank: 2,
    });
  });
});
