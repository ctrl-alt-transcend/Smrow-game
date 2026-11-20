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
import type { JwtPayload, GameList, FriendStatus } from 'shared';
import { parseCookie } from 'cookie';
import { UserService } from '../user/user.service';

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
  private readonly onlineUsers = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer() server: SocketServer;

  handleGameList(game: GameList[]) {
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

  @SubscribeMessage('friend: remove')
  async handleFriendRemove(client: SocketClient, friendId: string) {
    await this.userService.removeFriend(client.data.user.id, friendId);
    await this.sendFriendList(client);
  }

  @SubscribeMessage('friend: list')
  async handleFriendList(client: SocketClient) {
    await this.sendFriendList(client);
  }

  private async sendFriendList(client: SocketClient) {
    const friends = await this.userService.getFriendList(client.data.user.id);
    const friendsStatus: FriendStatus[] = friends.map((friend) => ({
      ...friend,
      isOnline: this.onlineUsers.has(friend.id),
    }));
    client.emit('friend: update', friendsStatus);
    console.log('Sent friend list to', client.data.user.username, friends); //TEST: DEV_ONLY
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

  handleDisconnect(client: SocketClient) {
    const userId = client.data.user.id;
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return;

    const index = sockets.indexOf(client.id);
    if (index !== -1) {
      sockets.splice(index, 1);
    }

    if (sockets.length === 0) {
      this.onlineUsers.delete(userId);
    }
  }

  handleConnection(client: SocketClient) {
    if (this.onlineUsers.has(client.data.user.id)) {
      this.onlineUsers.get(client.data.user.id)?.push(client.id);
    } else {
      this.onlineUsers.set(client.data.user.id, [client.id]);
    }
    console.log('Client connected:', client.id); //TEST:
  }
}
