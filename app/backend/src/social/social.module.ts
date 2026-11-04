import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SocialGateway } from './social.gateway';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET }), UserModule],
  controllers: [],
  providers: [SocialGateway],
  exports: [],
})
export class SocialModule {}
