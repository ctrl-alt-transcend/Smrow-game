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


  @SubscribeMessage('rollDice')
    async rollDice(@ConnectedSocket() client: Socket) {
    const result = this.gameService.rollDice();
    return { ...result };
    client.broadcast.to().emit('diceRolled', result); //INFO: broadcast the result to all players in the game room
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
