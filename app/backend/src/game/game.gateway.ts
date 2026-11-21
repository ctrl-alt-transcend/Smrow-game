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
  type JwtPayload,
  Phase,
  NotifColor,
} from 'shared';
import { JwtService } from '@nestjs/jwt';
import type { Namespace, Socket, DefaultEventsMap } from 'socket.io';
import { GameService } from './game.service';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import { GameStateContext } from './GameStateContext';
import { parseCookie } from 'cookie';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { Logger } from '@nestjs/common';

export interface SocketUser {
  id: string;
  username: string;
}

interface SocketData {
  user: SocketUser;
}

type SocketServer = Namespace<
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
  path: '/ws',
  namespace: 'game',
  cors: {
    origin: true,
    credentials: true,
  }, //WARN: dev only
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: SocketServer;
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
  ) {}

  /*---------- Game ----------*/

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

  @SubscribeMessage('game:start')
  async startGame(@ConnectedSocket() client: SocketClient) {
    this.logger.log(`:warnstartGame event received from client: client.id`);
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    if (game.getCurrentPhase() !== Phase.PENDING) {
      return;
    }
    if (game.getPlayers().size < 2) {
      const player = game.getPlayerByUsername(client.data.user.username);
      if (player) {
        game.setPersonalLog(
          player,
          'Not enough players to start the game.',
          NotifColor.PURPLE,
        );
      }
      await this.emitGameDataDto(game);
      return;
    }
    this.logger.verbose(
      `Game ${game.getGameId()}: starting with ${game.getPlayers().size} players`,
    );
    game.launchGame();
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

  /*------------------------------*/

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

  /*--------------------------------*/

  /*---------- Connection ----------*/

  afterInit(server: SocketServer) {
    this.gameService.setNotifier((id) => {
      const game = this.gameService.getGameInstanceByUserId(id);
      if (!game) return;
      void this.emitGameDataDto(game);
    });

    server.use((client: SocketClient, next) => {
      try {
        // Check is the client has a token or a cookie and save the cookie for verification with JWT
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
        this.logger.warn(
          `Client connection rejected: ${
            client.id
          } - ${(error as Error).message}`,
        );
        next(new Error('Authentication error'));
      }
    });
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
