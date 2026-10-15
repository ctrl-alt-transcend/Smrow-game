import { Controller, Get } from '@nestjs/common';
import { GameMasterService } from './gamemaster.service';

@Controller('gamemaster')
export class GameMasterController {
  constructor(private readonly GameMaserService: GameMasterService) {}

  @Get()
  getMessage() {
    return { message: this.GameMaserService.greetingsFromGM };
  }
}