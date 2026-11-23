import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';
import { authMiddleware } from '../ws/auth.middleware';
import type { SocketClient, SocketServer } from '../ws/socket.types';
import {
  type GameList,
  type FriendStatus,
  type ChatSendPayload,
  ChatSendPayloadSchema,
  IdSchema,
} from 'shared';
import { UserService } from '../user/user.service';
import { ZodValidationPipe } from 'nestjs-zod';

@WebSocketGateway({
  path: '/ws',
  namespace: 'social',
  cors: { credentials: true },
})
export class SocialGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocialGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer() server: SocketServer;

  /*---------- Game ----------*/

  handleGameList(game: GameList[]) {
    this.server.to('gameList').emit('gameList:update', game);
  }

  @SubscribeMessage('gameList:join')
  async handleJoinGameList(@ConnectedSocket() client: SocketClient) {
    await client.join('gameList');
  }

  @SubscribeMessage('gameList:leave')
  async handleLeaveGameList(@ConnectedSocket() client: SocketClient) {
    await client.leave('gameList');
  }

  /*---------- Chat ----------*/

  @SubscribeMessage('chat:send')
  async handleChatMessage(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(ChatSendPayloadSchema))
    payload: ChatSendPayload,
  ) {
    const chatMessage = await this.chatService.addChatMessage(
      client.data.user.id,
      payload.draft,
    );
    this.server.to('chat').emit('chat:message', chatMessage);
  }

  @SubscribeMessage('chat:join')
  async handleJoinChat(@ConnectedSocket() client: SocketClient) {
    await client.join('chat');
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveChat(@ConnectedSocket() client: SocketClient) {
    await client.leave('chat');
  }

  /*---------- Friends ----------*/

  @SubscribeMessage('friend:remove')
  async handleFriendRemove(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(IdSchema)) friendId: string,
  ) {
    await this.userService.removeFriend(client.data.user.id, friendId);
    await this.sendFriendList(client);
  }

  @SubscribeMessage('friend:list')
  async handleFriendList(@ConnectedSocket() client: SocketClient) {
    await this.sendFriendList(client);
  }

  private async sendFriendList(client: SocketClient) {
    const friends = await this.userService.getFriendList(client.data.user.id);
    const friendsStatus: FriendStatus[] = friends.map((friend) => ({
      ...friend,
      isOnline: this.server.adapter.rooms.has(`user:${friend.id}`),
    }));
    client.emit('friend:update', friendsStatus);
  }

  /*---------- Connection ----------*/

  afterInit(server: SocketServer) {
    server.use(authMiddleware(this.jwtService, this.logger));
  }

  async handleConnection(client: SocketClient) {
    await client.join(`user:${client.data.user.id}`);
    this.logger.debug(
      `Client connected: ${client.id} - ${client.data.user.username}`,
    );
  }

  handleDisconnect(client: SocketClient) {
    this.logger.debug(
      `Client disconnected: ${client.id} - ${client.data.user.username}`,
    );
  }
}
