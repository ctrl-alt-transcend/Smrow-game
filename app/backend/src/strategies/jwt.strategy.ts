import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from 'shared';
import { UserService } from '../user/user.service';
import { readSecret } from './readSecret';
import { AUTH } from '../config/config';
import type { Request } from 'express';

// extractor for the cookie returned by the backend
const cookieExtractor = (req: Request): string | null => {
  const token: unknown = req.cookies?.access_token ?? null;
  return typeof token === 'string' ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, //added the cookie stractor to the JwtStrategy so we intercept the cookie inside
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: readSecret(AUTH.JWT_FILE),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, name: user.name, email: user.email };
  }
}
