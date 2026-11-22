import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from '../user/user.module';
import { StatsModule } from '../stats/stats.module';
import { SocialModule } from '../social/social.module';
import { SpectateGateway } from './spectate.gateway';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    UserModule,
    StatsModule,
    SocialModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, SpectateGateway],
  exports: [GameService],
})
export class GameModule {}
