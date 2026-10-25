import {
  ConnectedSocket,
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
  @SubscribeMessage('rollDice')
    async rollDice(@ConnectedSocket() client: Socket) {
    const gameState = this.gameService.getGameStateByUserId(client.data.user.id);
    const result = this.gameService.diceRequest();

    gameState.diceRoll = result.value;
    gameState.masterLog = result.message;
    client.to(gameState.gameId).emit('gameState'); //INFO: Always return the new gameState to all client in the room
    //client.broadcast.to(gameState.gameId).emit('diceRolled', );
    return { ...result };
  }

  @SubscribeMessage('build')
    async buils(@ConnectedSocket() client: Socket) {
    const gameState = this.gameService.getGameStateByUserId(client.data.user.id);
    const result = this.gameService.buildRequest();

    gameState.diceRoll = result.value;
    gameState.masterLog = result.message;
    client.to(gameState.gameId).emit('gameState'); //INFO: Always return the new gameState to all client in the room
    //client.broadcast.to(gameState.gameId).emit('diceRolled', );
    return { ...result };
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    try {
      const gameState = this.gameService.getGameStateByUserId(userId)
      await client.join(gameState.gameId);
      return { ok: true, data: gameState };
    }
    catch {
      return { ok: false, error: "not in game" };
    }
  }


  handleConnection(client: Socket) { //TODO: Use middleware to check the token before the connection is established "next()"
    try {
      console.log('Client connected:', client.id);
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token, {secret: readSecret('JWT_SECRET_FILE')});
      client.data.user = {id: payload.sub};
    }
    catch (error) {
      console.log('Client connection rejected:', client.id, " - ", (error as Error).message);
      client.disconnect(true); //WARN: what happens in the frontend ?
      //TODO: remove player of the GameStat
      return ; //TEST: remove this line
    }

    client.emit('message', 'Welcome to the game server!'); //TEST: remove this line
  }
}
