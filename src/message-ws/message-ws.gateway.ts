import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(MessageWsGateway.name);

  @WebSocketServer()
  wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket, ...args: any[]) {

    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {

      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);

    } catch (error) {
      client.disconnect();
      this.logger.warn(`Invalid credentials by clientId ${client.id}`)
      return;
    }

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());

  }
  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {

    const user = this.messageWsService.getUser(client.id);

    this.wss.emit('message-from-server', {
      fullname: user.fullname,
      message: payload.message || 'Empty Message!!'
    })

  }
}
