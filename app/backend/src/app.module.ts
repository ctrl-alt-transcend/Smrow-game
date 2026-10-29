import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { GamesModule } from './games/games.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    StatsModule,
    GameModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
