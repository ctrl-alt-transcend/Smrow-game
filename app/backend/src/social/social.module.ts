import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SocialGateway } from './social.gateway';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET }), UserModule, ChatModule],
  controllers: [],
  providers: [SocialGateway],
  exports: [SocialGateway],
})
export class SocialModule {}
