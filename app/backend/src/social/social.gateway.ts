import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { authMiddleware } from '../ws/auth.middleware';
import { Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';
import {
  type GameList,
  type ChatSendPayload,
  ChatSendPayloadSchema,
} from 'shared';
import type { SocketClient, SocketServer } from '../ws/socket.types';
import { ZodValidationPipe } from 'nestjs-zod';

@WebSocketGateway({
  path: '/ws',
  namespace: 'social',
  cors: { credentials: true },
})
export class SocialGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(SocialGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer() server: SocketServer;

  /*---------- Game ----------*/

  handleGameList(game: GameList[]) {
    this.server.to('gameList').emit('gameList:update', game);
  }

  @SubscribeMessage('gameList:join')
  async handleJoinGameList(client: SocketClient) {
    await client.join('gameList');
  }

  @SubscribeMessage('gameList:leave')
  async handleLeaveGameList(client: SocketClient) {
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
  async handleJoinChat(client: SocketClient) {
    await client.join('chat');
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveChat(client: SocketClient) {
    await client.leave('chat');
  }

  /*---------- Connection ----------*/

  afterInit(server: SocketServer) {
    server.use(authMiddleware(this.jwtService, this.logger));
  }

  handleConnection(client: SocketClient) {
    //TODO: handle multiple connections from the same user.
    this.logger.verbose(`Client connected: ${client.id}`);
  }
}
