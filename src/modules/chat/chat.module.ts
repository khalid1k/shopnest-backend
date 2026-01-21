import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

@Module({
  imports: [ConfigModule, JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production',
          expiresIn: configService.get<StringValue>('JWT_ACCESS_TOKEN_EXPIRY') || '2d',
        }),
      }),],
  providers: [ChatGateway],
})
export class ChatModule {}
