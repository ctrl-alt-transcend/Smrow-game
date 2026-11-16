import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { DatabaseService } from '../database/database.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsService, { provide: DatabaseService, useValue: {} }],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
