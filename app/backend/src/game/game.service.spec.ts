import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { StatsService } from '../stats/stats.service';
import { SocialGateway } from '../social/social.gateway';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: StatsService, useValue: {} },
        { provide: SocialGateway, useValue: {} },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
