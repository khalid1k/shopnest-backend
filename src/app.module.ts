import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import * as path from 'path';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,
      // Load .env files from multiple possible locations
      // This ensures it works whether running from project root or apps/backend directory
      envFilePath: [
        // Default: current working directory (works when running from apps/backend)
        '.env',
        '.env.local',
        `.env.${process.env.NODE_ENV || 'development'}`,
        // Project root location (when running from project root)
        path.resolve(process.cwd(), 'apps', 'backend', '.env'),
        path.resolve(process.cwd(), 'apps', 'backend', '.env.local'),
        path.resolve(process.cwd(), 'apps', 'backend', `.env.${process.env.NODE_ENV || 'development'}`),
        // Compiled location fallback (for production deployments)
        path.join(__dirname, '..', '..', '.env'),
        path.join(__dirname, '..', '..', '.env.local'),
        path.join(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
      ],
      // In production, also read from system environment variables
      // This allows environment variables to be set by the hosting platform (IIS, Docker, etc.)
      // System environment variables take precedence over .env files
      ignoreEnvFile: false, // Don't ignore .env files even in production
      // Cache the configuration for better performance
      cache: true,
      // Expand variables in .env files (e.g., ${VAR})
      expandVariables: true,
    }),DatabaseModule, AuthModule, ChatModule],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {}
