import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection  } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import type { JwtPayload } from '@shared/types';

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


@WebSocketGateway({path: 'ws/social'})
export class SocialGateway implements OnGatewayInit, OnGatewayConnection {


  constructor(private readonly jwtService: JwtService) {}

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  afterInit(server: SocketServer) {
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

  handleConnection(client: Socket) {
    //TODO: handle multiple connections from the same user.
    console.log('Client connected:', client.id); //TEST:
    client.join("chat");
  }
}
