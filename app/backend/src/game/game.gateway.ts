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
} from 'shared';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import { GameService } from './game.service';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import { GameStateContext } from './GameStateContext';
import { parseCookie } from 'cookie';
import { ZodValidationPipe } from 'nestjs-zod';

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
  path: '/ws/game',
  cors: {
    origin: true,
    credentials: true,
  }, //WARN: dev only
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: SocketServer;

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
  ) {}

  private emitGameDataDto(game: GameStateContext, user: string) {
    let gameData: GameDataDto;
    try {
      gameData = game.getGameDataDto(user);
    } catch (e) {
      console.log(`Error: ${e}`);
      return;
    }
    this.server.to(game.getGameId()).emit('gameState', gameData);
    if (game.isGameTerminated()) {
      //TODO:Reactivate this when the game is finished, the game instance is removed from memory and the clients are disconnected
      this.endGame(game);
    }
    // every action ends here, so a finished game is recorded right away
    void this.gameService.recordResultIfOver(game);
  }

  @SubscribeMessage('startGame')
  startGame(@ConnectedSocket() client: SocketClient) {
    console.log('startGame event received from client:', client.id);
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    if (game.getCurrentPhase() !== Phase.PENDING) {
      return;
    }
    if (game.getPlayers().size < 2) {
      const player = game.getPlayerById(client.data.user.username);
      if (player) {
        game.setPersonalLog(player, 'Not enough players to start the game.');
      }
      this.emitGameDataDto(game, client.data.user.username);
    }
    console.log(
      `Starting game ${game.getGameId()} with ${game.getPlayers().size} players.`,
    );
    game.setCurrentPhase(Phase.START);
    this.emitGameDataDto(game, client.data.user.username);
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

    //⚠️ FOR TESTING
    game.skipRequest(`${ZGEG_DEV}`);
    game.phaseCheckRequest();
    // -------------

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

    //⚠️ FOR TESTING
    game.buildRequest(`${ZGEG_DEV}`, payload);
    game.phaseCheckRequest();
    // -------------

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

    //⚠️ FOR TESTING
    game.tradeRequest(`${ZGEG_DEV}`, payload);
    game.phaseCheckRequest();
    // -------------

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
      console.log('joinRoom failed', e);
      return { ok: false, error: 'not in game' };
    }
  }

  private endGame(game: GameStateContext) {
    const gameId = game.getGameId();
    this.server.in(gameId).socketsLeave(gameId);
    this.gameService.removeGameInstance(gameId);
  }

  async afterInit(server: SocketServer) {
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

  handleConnection(client: SocketClient) {
    console.log('Client connected:', client.id); //TEST:
  }
}
