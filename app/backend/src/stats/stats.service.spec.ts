import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StatsService } from './stats.service';
import { DatabaseService } from '../database/database.service';
import type { GameResult, GameResultPlayer } from 'shared';

const player = (
  userId: string,
  overrides: Partial<GameResultPlayer> = {},
): GameResultPlayer => ({
  userId,
  turnOrder: 0,
  winPoints: 0,
  isWinner: false,
  playerRank: 2,
  settlementBuilt: 0,
  citiesBuilt: 0,
  devCardsBought: 0,
  ...overrides,
});

const validResult = (): GameResult => ({
  totalTurns: 20,
  duration: 900,
  players: [
    player('u1', { turnOrder: 0, isWinner: true, playerRank: 1 }),
    player('u2', { turnOrder: 1, playerRank: 2 }),
  ],
});

describe('StatsService', () => {
  let service: StatsService;
  const db = {
    user: { findMany: jest.fn() },
    games: { create: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsService, { provide: DatabaseService, useValue: db }],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  describe('recordGameResult', () => {
    it('creates the game with every player result', async () => {
      db.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      db.games.create.mockResolvedValue({ id: 'g1' });

      await service.recordGameResult(validResult());

      expect(db.games.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalTurns: 20,
            players: {
              createMany: { data: [expect.anything(), expect.anything()] },
            },
          }) as unknown,
        }),
      );
    });

    it('rejects unknown users', async () => {
      db.user.findMany.mockResolvedValue([{ id: 'u1' }]);

      await expect(service.recordGameResult(validResult())).rejects.toThrow(
        'Unknown users: u2',
      );
      expect(db.games.create).not.toHaveBeenCalled();
    });

    it.each<[string, (r: GameResult) => void]>([
      ['no player', (r) => (r.players = [])],
      ['duplicated player', (r) => (r.players[1].userId = 'u1')],
      ['duplicated turnOrder', (r) => (r.players[1].turnOrder = 0)],
      ['negative counter', (r) => (r.players[0].citiesBuilt = -1)],
      ['rank 0', (r) => (r.players[1].playerRank = 0)],
      ['winner not ranked 1', (r) => (r.players[0].playerRank = 3)],
      ['invalid date', (r) => (r.playedAt = 'yesterday')],
    ])('rejects %s', async (_, mutate) => {
      const result = validResult();
      mutate(result);

      await expect(service.recordGameResult(result)).rejects.toThrow(
        BadRequestException,
      );
      expect(db.games.create).not.toHaveBeenCalled();
    });

    it('accepts a game without recorded winner (bot won)', async () => {
      db.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      const result = validResult();
      result.players[0] = player('u1', { isWinner: false, playerRank: 2 });
      result.players[1].playerRank = 3;

      await expect(service.recordGameResult(result)).resolves.not.toThrow();
    });
  });
});
