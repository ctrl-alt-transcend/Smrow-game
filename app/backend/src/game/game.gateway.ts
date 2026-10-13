import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001)
export class GameGateway {

  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('Received message:', payload);
    return 'Hello world!';
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }
}
