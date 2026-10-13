import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001)
export class GameGateway {

  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('Received message:', payload);
    return 'Hello world!';
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket) {
    client.join("room");
    client.emit('message', 'You have joined the room!');
    this.server.to("room").emit('message', "new client joined the room!");
  }

  handleConnection(client: Socket) {
    console.log('Client connected with clienID: ', client.id);
    client.emit('message', 'Welcome to the game server!');
  }

}
