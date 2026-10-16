import { Test, TestingModule } from '@nestjs/testing';
import { GamemasterService } from './gamemaster.service';

describe('GamemasterService', () => {
  let service: GamemasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamemasterService],
    }).compile();

    service = module.get<GamemasterService>(GamemasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
