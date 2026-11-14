import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import type { JwtPayload, GameList } from 'shared';

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

  handleGameList(game: GameList) {
    this.server.to('gameList').emit('game list update', game);
  }

  @SubscribeMessage('joinGameList')
  async handleJoimGameList(client: SocketClient) {
    await client.join('gameList');
  }

  @SubscribeMessage('leaveGameList')
  async handeLeaveGameList(client: SocketClient) {
    await client.leave('gameList');
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: SocketClient, payload: { draft: string }) {
    if (typeof payload.draft !== 'string') {
      return;
    }
    const content = payload.draft.trim();
    if (content.length === 0 || content.length > 500) {
      return;
    }
    console.log(client.data.user.username, 'sent a chat message:', content); //TEST: DEV_ONLY

    const chatMessage = await this.chatService.addChatMessage(
      client.data.user.id,
      content,
    );
    this.server.to('chat').emit('new chat message', chatMessage);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: SocketClient) {
    await client.join('chat');
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(client: SocketClient) {
    await client.leave('chat');
  }

  async afterInit(server: SocketServer) {
    /** @warning development only */
    if (process.env.NODE_ENV === 'development') {
      const { instrument } = await import('@socket.io/admin-ui'); //WARN: dev only
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

  handleConnection(client: Socket) {
    //TODO: handle multiple connections from the same user.
    console.log('Client connected:', client.id); //TEST:
  }
}
