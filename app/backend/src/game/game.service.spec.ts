import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { StatsService } from '../stats/stats.service';
import type { GameStateContext } from './GameStateContext';

describe('GameService', () => {
  let service: GameService;
  const stats = { recordGameResult: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService, { provide: StatsService, useValue: stats }],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordResultIfOver', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const startGame = (): GameStateContext => {
      service.createGame({ id: 'u-alice', username: 'alice', avatarURL: null });
      return service.getGameInstanceByUserId('u-alice');
    };
    const win = (game: GameStateContext) => {
      game.setTurnOrder(['alice']);
      game.setVictory('alice', 'won');
    };

    it('does nothing while the game has no winner', async () => {
      await service.recordResultIfOver(startGame());

      expect(stats.recordGameResult).not.toHaveBeenCalled();
    });

    it('records a finished game only once, with real players only', async () => {
      const game = startGame();
      win(game);

      await service.recordResultIfOver(game);
      await service.recordResultIfOver(game);

      expect(stats.recordGameResult).toHaveBeenCalledTimes(1);
      expect(stats.recordGameResult).toHaveBeenCalledWith(
        expect.objectContaining({
          players: [
            expect.objectContaining({
              userId: 'u-alice',
              isWinner: true,
              playerRank: 1,
            }),
          ],
        }),
      );
    });

    it('logs a failure without throwing', async () => {
      const error = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => {});
      stats.recordGameResult.mockRejectedValue(new Error('db down'));
      const game = startGame();
      win(game);

      await expect(service.recordResultIfOver(game)).resolves.toBeUndefined();
      expect(error).toHaveBeenCalled();
    });
  });
});
