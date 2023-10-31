import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) {
    client.send(JSON.stringify([]));
  }
}
