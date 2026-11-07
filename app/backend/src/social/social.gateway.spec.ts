import { Test, TestingModule } from '@nestjs/testing';
import { SocialGateway } from './social.gateway';

describe('SocialGateway', () => {
  let gateway: SocialGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialGateway],
    }).compile();

    gateway = module.get<SocialGateway>(SocialGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
