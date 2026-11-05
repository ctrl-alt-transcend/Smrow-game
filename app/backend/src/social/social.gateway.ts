import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import type { JwtPayload } from '@shared/types';
import { instrument } from '@socket.io/admin-ui'; //WARN: dev only

export interface SocketUser {
  id: string;
  username: string;
}

export interface SocketData {
  user: SocketUser;
}

export type SocketServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
export type SocketClient = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

@WebSocketGateway({
  path: '/ws/social',
  cors: {
    origin: true,
    credentials: true,
  }, //WARN: dev only
})

export class SocialGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(private readonly jwtService: JwtService) {}

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  afterInit(server: SocketServer) {

    /** @warning development only */
    if (process.env.NODE_ENV === 'development') {
      instrument(server, {
          auth: false,
          mode: "development",
        });
    }
    server.use((client: SocketClient, next) => {
      try {
        const token = client.handshake.auth.token as string;
        const payload = this.jwtService.verify<JwtPayload>(token, {
          secret: readSecret(AUTH.JWT_FILE),
        });
        client.data.user = { id: payload.sub, username: payload.username };
        next();
      } catch (error) {
        console.log(
          'Client connection rejected:',
          client.id,
          ' - ',
          (error as Error).message,
        );
        next(new Error('Authentication error'));
      }
    });
  }

  async handleConnection(client: Socket) {
    //TODO: handle multiple connections from the same user.
    console.log('Client connected:', client.id); //TEST:
    await client.join('chat');
  }
}
