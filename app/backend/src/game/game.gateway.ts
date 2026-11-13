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
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import type { JwtPayload } from 'shared';
import type { BuildRequestPayload } from 'shared';
import { GameService } from './game.service';
import { readSecret } from '../strategies/readSecret';
import { AUTH } from '../config/config';
import { instrument } from '@socket.io/admin-ui'; //WARN: dev only
import { parseCookie } from 'cookie';

export interface SocketUser {
  id: string;
  username: string;
}

export interface SocketData {
  user: SocketUser;
}

export type SocketServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
export type SocketClient = Socket<
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

  /**
   * @brief Handle the 'dice' event from the client.
   * @details Always broadcasts the new gameState to all clients in the room.
   */
  @SubscribeMessage('dice')
  dice(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    const result = game.diceRequest(client.data.user.username);

    //⚠️ FOR TESTING
    game.phaseCheckRequest();
    game.diceRequest('enriquest');
    game.phaseCheckRequest();
    game.diceRequest('spagg');
    // -------------

    game.phaseCheckRequest();
    game.setDiceRoll(result.value);
    game.setMasterLog(result.message);
    this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto());
    return { ...result };
  }

  @SubscribeMessage('skip')
  skip(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    const result = game.skipRequest(client.data.user.username);

    //⚠️ FOR TESTING
    game.phaseCheckRequest();
    game.skipRequest('enriquest');
    game.phaseCheckRequest();
    game.skipRequest('spagg');
    // -------------

    game.phaseCheckRequest();
    game.setDiceRoll(result.value);
    game.setMasterLog(result.message);
    this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto());
    return { ...result };
  }

  @SubscribeMessage('build')
  build(
    @ConnectedSocket() client: SocketClient,
    @MessageBody() payload: BuildRequestPayload,
  ) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    const result = game.buildRequest(client.data.user.username, payload);

    //⚠️ FOR TESTING
    game.phaseCheckRequest();
    game.buildRequest('enriquest', payload);
    game.phaseCheckRequest();
    game.buildRequest('spagg', payload);
    // -------------

    game.phaseCheckRequest();
    game.setDiceRoll(result.value);
    game.setMasterLog(result.message);
    this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto());
    return { ...result };
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: SocketClient) {
    const userId = client.data.user.id;
    try {
      const game = this.gameService.getGameInstanceByUserId(userId);
      await client.join(game.getGameId());
      game.setMasterLog(`${client.data.user.username} joined the room`);
      this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto());
      return { ok: true, data: game.getGameDataDto() };
    } catch (e) {
      console.log('joinRoom failed', e);
      return { ok: false, error: 'not in game' };
    }
  }

  afterInit(server: SocketServer) {
    /** @warning development only */
    if (process.env.NODE_ENV === 'development') {
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
