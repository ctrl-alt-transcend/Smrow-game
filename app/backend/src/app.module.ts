import { Module } from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { GamesModule } from './games/games.module';
import { StatsModule } from './stats/stats.module';
import { SocialModule } from './social/social.module';
import { ChatModule } from './chat/chat.module';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    StatsModule,
    GameModule,
    GamesModule,
    SocialModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    AppService,
  ],
})
export class AppModule {}
