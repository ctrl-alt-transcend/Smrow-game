import { Module } from '@nestjs/common';
import { GameMasterController } from './gamemaster.controller';
import { GameMasterService } from './gamemaster.service';

@Module({
  controllers: [GameMasterController],
  providers: [GameMasterService],
})
export class GameMasterModule {}