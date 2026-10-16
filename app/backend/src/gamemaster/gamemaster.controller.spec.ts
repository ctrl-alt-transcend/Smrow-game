import { Test, TestingModule } from '@nestjs/testing';
import { GamemasterController } from './gamemaster.controller';
import { GamemasterService } from './gamemaster.service';

describe('GamemasterController', () => {
  let controller: GamemasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamemasterController],
      providers: [GamemasterService],
    }).compile();

    controller = module.get<GamemasterController>(GamemasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
