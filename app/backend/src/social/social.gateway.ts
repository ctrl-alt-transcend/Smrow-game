import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketServer
} from '@nestjs/websockets';
import { Prisma } from '@prisma/client';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';
import type {Server, Socket, DefaultEventsMap } from 'socket.io';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import type { JwtPayload, ChatMessage } from '@shared/types';

interface SocketUser {
  id: string;
  username: string;
}

interface SocketData {
  user: SocketUser;
}

type SocketServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
type SocketClient = Socket<
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
  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer() server: SocketServer;

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: SocketClient, payload: { draft: string }) {
    console.log(client.data.user.username, 'sent a chat message:', payload.draft); //TEST: DEV_ONLY

    const chatMessage = await this.chatService.addChatMessage(client.data.user.id, payload.draft);
    this.server.to('chat').emit('new chat message', chatMessage);
  }

  afterInit(server: SocketServer) {
    /** @warning development only */
    if (process.env.NODE_ENV === 'development') {

      const { instrument } = require('@socket.io/admin-ui'); //WARN: dev only
      instrument(server, {
        auth: false,
        mode: 'development',
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
