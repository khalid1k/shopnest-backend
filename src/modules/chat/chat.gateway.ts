import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { messages } from '../database/schema';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()                 
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      client.data.user = payload;
      console.log('✅ WS connected:', payload.sub);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: { message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;


    const [savedMessage] = await this.db.db
      .insert(messages)
      .values({
        message: payload.message,
        senderId: user.sub,
      })
      .returning();

    this.server.emit('message', {
      id: savedMessage.id,
      message: savedMessage.message,
      senderId: user.sub,
      senderName: user.fullName,
      createdAt: savedMessage.createdAt,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket) {
  const user = client.data.user;

  client.broadcast.emit('typing', {
    user: user.fullName,
  });
}

 @SubscribeMessage('stopTyping')
  handleStopTyping(@ConnectedSocket() client: Socket) {

  client.broadcast.emit('stopTyping');
}


  handleDisconnect(client: Socket) {
    console.log('🔌 Disconnected:', client.data.user?.sub);
  }
}
