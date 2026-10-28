import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { readSecret } from 'src/strategies/readSecret';
import { AUTH } from '../config/config'

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: readSecret(AUTH.JWT_FILE),
      signOptions: { expiresIn: AUTH.TOKEN_EXPIRATION_TIME},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
