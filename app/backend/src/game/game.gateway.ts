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
import { instrument } from '@socket.io/admin-ui';
import type { JwtPayload } from '@shared/types';
import type { BuildRequestPayload } from '@shared/game/game.types';
import { GameService } from './game.service';
import { readSecret } from '../strategies/readSecret';

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

  afterInit(server: SocketServer) {
    instrument(server, { auth: false, mode: 'development' });
  }

  /**
   * @brief Handle the 'dice' event from the client.
   * @details Always broadcasts the new gameState to all clients in the room.
   */
  @SubscribeMessage('dice')
  dice(@ConnectedSocket() client: SocketClient) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    const result = game.diceRequest(client.data.user.username);

    //⚠️ FOR TESTING
    // game.phaseCheckRequest();
    // game.diceRequest('enriquest');
    // game.phaseCheckRequest();
    // game.diceRequest('spagg');
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
    // game.phaseCheckRequest();
    // game.buildRequest('enriquest', payload);
    // game.phaseCheckRequest();
    // game.buildRequest('spagg', payload);
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

  handleConnection(client: SocketClient) {
    //TODO: Use middleware to check the token before the connection is established "next()"
    try {
      console.log('Client connected:', client.id); //TEST:
      const token = client.handshake.auth.token as string;
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: readSecret('JWT_SECRET_FILE'),
      });
      client.data.user = { id: payload.sub, username: payload.username };
    } catch (error) {
      console.log(
        'Client connection rejected:',
        client.id,
        ' - ',
        (error as Error).message,
      );
      client.disconnect(true); //WARN: what happens in the frontend ?
      //TODO: remove player of the GameStat
    }
  }
}
