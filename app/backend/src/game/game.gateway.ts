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
  GameDataDto,
  ZGEG_DEV,
  type JwtPayload,
  Phase,
  NotifColor,
} from 'shared';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import { GameService } from './game.service';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import { GameStateContext } from './GameStateContext';
import { parseCookie } from 'cookie';
import { ZodValidationPipe } from 'nestjs-zod';
import { Logger } from '@nestjs/common';

export interface SocketUser {
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
  path: '/ws/game',
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

  private emitGameDataDto(game: GameStateContext, user: string) {
    let gameData: GameDataDto;
    try {
      gameData = game.getGameDataDto(user);
    } catch (e) {
      this.logger.error(
        `Game ${game.getGameId()}: getGameDataDto failed for ${user}`,
        e instanceof Error ? e.stack : String(e),
      );
      return;
    }
    this.server.to(game.getGameId()).emit('gameState', gameData);
    if (game.isGameTerminated()) {
      this.endGame(game);
    }
    // every action ends here, so a finished game is recorded right away
    void this.gameService.recordResultIfOver(game);
  }

  @SubscribeMessage('startGame')
  startGame(@ConnectedSocket() client: SocketClient) {
    this.logger.verbose(
      `startGame received from ${client.data.user.username} (${client.id})`,
    );
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
      this.emitGameDataDto(game, client.data.user.username);
    }
    this.logger.verbose(
      `Game ${game.getGameId()}: starting with ${game.getPlayers().size} players`,
    );
    game.launchGame();
    this.emitGameDataDto(game, client.data.user.username);
  }

  @SubscribeMessage('quitGame')
  handleQuitGame(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    this.gameService.removePlayerFromGame(client.data.user, game.getGameId());
    client.disconnect(true);
    this.logger.log(`Player ${client.data.user.username} quit the game`);
  }

  /**
   * @brief Handle the 'dice' event from the client.
   * @details Always broadcasts the new gameState to all clients in the room.
   */
  @SubscribeMessage('dice')
  dice(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.diceRequest(client.data.user.username);
    game.phaseCheckRequest();

    //⚠️ FOR TESTING
    game.diceRequest(`${ZGEG_DEV}`);
    game.phaseCheckRequest();
    // -------------

    this.emitGameDataDto(game, client.data.user.username);
  }

  @SubscribeMessage('skip')
  skip(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.skipRequest(client.data.user.username);
    game.phaseCheckRequest();
    this.emitGameDataDto(game, client.data.user.username);
  }

  @SubscribeMessage('build')
  build(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(BuildPayloadSchema))
    payload: BuildPayload,
  ) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.buildRequest(client.data.user.username, payload);
    game.phaseCheckRequest();
    this.emitGameDataDto(game, client.data.user.username);
  }

  @SubscribeMessage('trade')
  trade(
    @ConnectedSocket() client: SocketClient,
    @MessageBody(new ZodValidationPipe(TradePayloadSchema))
    payload: TradePayload,
  ) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    game.tradeRequest(client.data.user.username, payload);
    game.phaseCheckRequest();
    this.emitGameDataDto(game, client.data.user.username);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: SocketClient) {
    const userId = client.data.user.id;
    try {
      const game = this.gameService.getGameInstanceByUserId(userId);
      await client.join(game.getGameId());
      this.emitGameDataDto(game, client.data.user.username);
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
  }

  async afterInit(server: SocketServer) {
    this.gameService.setNotifier((id, username) => {
      const game = this.gameService.getGameInstanceByUserId(id);
      this.emitGameDataDto(game, username);
    });

    /** @warning development only */
    if (process.env.NODE_ENV === 'development') {
      const { instrument } = await import('@socket.io/admin-ui'); //WARN: dev only
      instrument(this.server, {
        auth: false,
        mode: 'development',
      });
    }

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
}
