import { readSecret } from '../strategies/readSecret';
import { parseCookie } from 'cookie';
import { AUTH } from '../config/config';
import type { JwtPayload } from 'shared';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import type { SocketClient } from './socket.types';

export function authMiddleware(jwtService: JwtService, logger: Logger) {
  return (client: SocketClient, next: (err?: Error) => void) => {
    try {
      const authToken = client.handshake.auth.token as string;
      const cookies = parseCookie(client.handshake.headers.cookie ?? '');
      const cookieToken = cookies.access_token;
      const token =
        cookieToken ||
        (typeof authToken === 'string' && authToken.length > 0
          ? authToken
          : cookieToken);
      if (!token) {
        throw new Error('JWT must be provided');
      }
      const payload = jwtService.verify<JwtPayload>(token, {
        secret: readSecret(AUTH.JWT_FILE),
      });
      client.data.user = { id: payload.sub, username: payload.username };
      next();
    } catch (error) {
      logger.warn(
        `Client connection rejected: ${client.id} - ${(error as Error).message}`,
      );
      next(new Error('Authentication error'));
    }
  };
}
