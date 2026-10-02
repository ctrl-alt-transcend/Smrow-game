import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' }, //INFO: the token will expire every 60 seconds, we can change it to a longer time if we want, but for testing purposes, we will keep it short
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
