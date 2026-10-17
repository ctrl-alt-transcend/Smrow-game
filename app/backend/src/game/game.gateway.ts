import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import type { RoomData } from '../../shared/game/websockets.types';
import { instrument } from '@socket.io/admin-ui';

@WebSocketGateway(3001, {
  cors: {
    origin: true,
    credentials: true,
  }, //WARN: dev only
})
export class GameGateway implements OnGatewayInit {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    instrument(server, { auth: false, mode: 'development' });
  }

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   console.log('Received message:', payload);
  //   return 'Hello world!';
  // }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomData: RoomData,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('room info: ', roomData);

    if (
      this.gameService.addPlayerToGame(roomData.room, roomData.playerId) ==
      false
    ) {
      console.log(`Game with id ${roomData.room} not found`);
      return;
      //TODO: send an error and disconnect the client
    }
    client.broadcast
      .to(roomData.room)
      .emit('message', `new client joined the room ${roomData.room}`);
    return { ok: true, room: roomData.room };
  }

  handleConnection(client: Socket) {
    //TODO: check if the client exists in database
    //TODO: check if the client already joined a room

    console.log('Client connected with clienID: ', client.id);
    client.emit('message', 'Welcome to the game server!');
  }
}
