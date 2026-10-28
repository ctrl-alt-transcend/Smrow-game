import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import { readSecret } from '../strategies/readSecret';
import type { BuildRequestPayload } from '@shared/game/game.types';

@WebSocketGateway(3001, {
  cors: {
    origin: true,
    credentials: true,
  }, //WARN: dev only
})
export class GameGateway implements OnGatewayInit {

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    instrument(server, { auth: false, mode: 'development' });
  }

  // @SubscribeMessage('gameMasterLog')

/**
 * @brief Handle the 'rollDice' event from the client.
 * @details SubscribeMessage is used to listen for the 'rollDice' event.
 *          ConnectedSocket decorator is used to get the socket of the client that sent the event.
 *          client.to(gameId).emit('diceRolled', result) is used to send the result of the dice roll to all clients in the same game.
 */
  @SubscribeMessage('dice')
    async dice(@ConnectedSocket() client: Socket) {
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
    game.setMasterLog(result.message)
    this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto()); //INFO: Always return the new gameState to all client in the room
    //client.broadcast.to(gameState.gameId).emit('diceRolled', );
    return { ...result };
  }

  @SubscribeMessage('build')
  async build(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BuildRequestPayload
  ) {
    const game = this.gameService.getGameInstanceByUserId(client.data.user.id);
    const result = game.buildRequest(client.data.user.username, payload);

      //⚠️ FOR TESTING
      // game.phaseCheckRequest();
      // game.buildRequest('enriquest', payload);
      // game.phaseCheckRequest();
      // game.buildRequest('spagg',payload);
      // -------------

    game.phaseCheckRequest();
    game.setDiceRoll(result.value);
    game.setMasterLog(result.message);
    this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto());
    return { ...result };
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    try {
      const game = this.gameService.getGameInstanceByUserId(userId)
      if (!game) throw new Error('Game not found');
      await client.join(game.getGameId());
      game.setMasterLog(`${client.data.user.username} joined the room`);
      console.log(game.getGameId());
      this.server.to(game.getGameId()).emit('gameState', game.getGameDataDto());
      return { ok: true, data: game.getGameDataDto() };
    }
    catch (e) {
      console.log('joinRoom failed', e);
      return { ok: false, error: 'not in game' };
    }
  }

  handleConnection(client: Socket) { //TODO: Use middleware to check the token before the connection is established "next()"
    try {
      console.log('Client connected:', client.id); //TEST:
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token, {secret: readSecret('JWT_SECRET_FILE')});
      client.data.user = {id: payload.sub, username: payload.username};
    }
    catch (error) {
      console.log('Client connection rejected:', client.id, " - ", (error as Error).message);
      client.disconnect(true); //WARN: what happens in the frontend ?
      //TODO: remove player of the GameStat
    }
  }
}
