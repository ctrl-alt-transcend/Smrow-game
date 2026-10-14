import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { JoinRoom } from '../../shared/game/websockets.types';

@WebSocketGateway(3001)
export class GameGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('Received message:', payload);
    return 'Hello world!';
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomData: JoinRoom,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('room info: ', roomData);
    console.log(`new client joined the room ${roomData.room}`);
    client.join(roomData.room);
    client.emit('message', `You have joined the room ${roomData.room} !`);
    this.server
      .to(roomData.room)
      .emit('message', `new client joined the room ${roomData.room}`);
  }

  handleConnection(client: Socket) {
    console.log('Client connected with clienID: ', client.id);
    client.emit('message', 'Welcome to the game server!');
  }
}
