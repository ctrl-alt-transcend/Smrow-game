import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { authMiddleware } from '../ws/auth.middleware';
import { Logger } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import type { SocketClient, SocketServer } from '../ws/socket.types';
import { GameService } from './game.service';
import type { GameDataDto } from 'shared';

@WebSocketGateway({
  path: '/ws',
  namespace: 'spectate',
  cors: { credentials: true },
})
export class SpectateGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: SocketServer;
  private readonly logger = new Logger(SpectateGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
  ) {}

  /*---------- Spectate ----------*/

  endSpectate(gameId: string) {
    this.server.in(gameId).disconnectSockets(false);
  }

  sendSpectateUpdate(gameId: string, gameDataDto: GameDataDto) {
    this.server.to(gameId).emit('spectate:update', gameDataDto);
  }

  @SubscribeMessage('spectate:join')
  async handleJoinSpectate(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(z.string().nonempty()))
    gameId: string,
  ) {
    try {
      const game = this.gameService.getGameInstanceByGameId(gameId);
      if (!game) return { ok: false, error: "game doesn't exist" };
      const dto = game.getGameDataDto(game.getWhosTurn());
      if (!dto) return { ok: false, error: 'no active player' };
      await client.join(game.getGameId());
      return { ok: true, data: dto };
    } catch (e) {
      this.logger.log(
        `User ${client.data.user.username} failed to join spectate for game ${gameId}: ${e}`,
      );
      return { ok: false, error: 'joinSpectate failed' };
    }
  }

  /*---------- Connection ----------*/

  afterInit(server: SocketServer) {
    server.use(authMiddleware(this.jwtService, this.logger));
  }

  handleConnection(client: SocketClient) {
    this.logger.log(
      `Client connected: ${client.id} - ${client.data.user.username}`,
    );
  }

  handleDisconnect(client: SocketClient) {
    this.logger.log(
      `Client disconnected: ${client.id} - ${client.data.user.username}`,
    );
  }
}
