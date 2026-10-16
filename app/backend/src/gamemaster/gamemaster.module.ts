import { Module } from '@nestjs/common';
import { GamemasterService } from './gamemaster.service';
import { GamemasterController } from './gamemaster.controller';

@Module({
  controllers: [GamemasterController],
  providers: [GamemasterService],
})
export class GamemasterModule {}
