import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  type BuildPayload,
  BuildPayloadSchema,
  type TradePayload,
  TradePayloadSchema,
} from 'shared';
import { JwtService } from '@nestjs/jwt';
import { authMiddleware } from '../ws/auth.middleware';
import { GameService } from './game.service';
import { GameStateContext } from './GameStateContext';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { Logger } from '@nestjs/common';
import type { SocketClient, SocketServer } from '../ws/socket.types';

@WebSocketGateway({
  path: '/ws',
  namespace: 'game',
  cors: { credentials: true },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: SocketServer;
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
  ) {}

  /*---------- Game ----------*/

  @SubscribeMessage('game:start')
  async startGame(@ConnectedSocket() client: SocketClient) {
    this.logger.log(`startGame event received from client: ${client.id}`);
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.startRequest(client.data.user.username);
    await this.emitGameDataDto(game);
  }

  @SubscribeMessage('game:quit')
  handleQuitGame(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    this.gameService.removePlayerFromGame(client.data.user, game.getGameId());
    client.disconnect(false);
    this.logger.log(`Player ${client.data.user.username} quit the game`);
  }

  /**
   * @brief Handle the 'dice' event from the client.
   * @details Always broadcasts the new gameState to all clients in the room.
   */
  @SubscribeMessage('game:dice')
  async dice(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.diceRequest(client.data.user.username);
    game.phaseCheckRequest();
    await this.emitGameDataDto(game);
  }

  @SubscribeMessage('game:skip')
  async skip(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.skipRequest(client.data.user.username);
    game.phaseCheckRequest();
    await this.emitGameDataDto(game);
  }

  @SubscribeMessage('game:build')
  async build(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(BuildPayloadSchema))
    payload: BuildPayload,
  ) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.buildRequest(client.data.user.username, payload);
    game.phaseCheckRequest();
    await this.emitGameDataDto(game);
  }

  @SubscribeMessage('game:trade')
  async trade(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(TradePayloadSchema))
    payload: TradePayload,
  ) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.tradeRequest(client.data.user.username, payload);
    game.phaseCheckRequest();
    await this.emitGameDataDto(game);
  }

  @SubscribeMessage('game:join')
  async handleJoinRoom(@ConnectedSocket() client: SocketClient) {
    const userId = client.data.user.id;
    try {
      const game = this.gameService.getGameInstanceByUserId(userId);
      await client.join(game.getGameId());
      await this.emitGameDataDto(game);
      return { ok: true, data: game.getGameDataDto(client.data.user.username) };
    } catch (e) {
      this.logger.warn(
        `joinRoom failed for ${client.data.user.username}: ${(e as Error).message}`,
      );
      return { ok: false, error: 'not in game' };
    }
  }

  private endGame(game: GameStateContext) {
    const gameId = game.getGameId();
    this.server.in(gameId).socketsLeave(gameId);
    this.gameService.removeGameInstance(gameId);
    this.logger.log(`Game ${gameId}: ended and deleted`);
  }

  private async emitGameDataDto(game: GameStateContext): Promise<void> {
    const sockets = await this.server.in(game.getGameId()).fetchSockets();
    for (const socket of sockets) {
      const dto = game.getGameDataDto(socket.data.user.username);
      if (dto) socket.emit('game:state', dto);
    }
    if (game.isGameTerminated()) {
      this.endGame(game);
    }
    void this.gameService.recordResultIfOver(game);
  }

  /*---------- Spectate ----------*/

  @SubscribeMessage('spectate:join')
  async handleJoinSpectate(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(z.string().nonempty()))
    gameId: string,
  ) {
    try {
      const game = this.gameService.getGameInstanceByGameId(gameId);
      if (!game) return { ok: false, error: "game doesn't exist" };
      await client.join(game.getGameId());
      return { ok: true, data: game.getGameDataDto(game.getWhosTurn()) };
    } catch (e) {
      console.log('joinSpectate failed', e);
      return { ok: false, error: 'joinSpectate failed' };
    }
  }

  /*---------- Connection ----------*/

  afterInit(server: SocketServer) {
    this.gameService.setNotifier((id) => {
      const game = this.gameService.getGameInstanceByUserId(id);
      if (!game) return;
      void this.emitGameDataDto(game);
    });

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
