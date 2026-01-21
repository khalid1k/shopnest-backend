import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   const configService = app.get(ConfigService);

   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  app.setGlobalPrefix('api');

  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000/');
  // Configure CORS options
  const corsOptions: {
    origin: boolean | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    credentials?: boolean;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    maxAge?: number;
  } = {
    // Allow all origins if set to '*', otherwise use whitelist
    origin: corsOrigins === '*'
      ? true
      : (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          
          const allowedOrigins = corsOrigins.split(',').map(o => o.trim());
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
    methods: configService.get<string>('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS').split(',').map(m => m.trim()),
    allowedHeaders: configService.get<string>('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,Accept,Origin,X-Requested-With,x-tenant-id,x-branch-id').split(',').map(h => h.trim()),
    exposedHeaders: configService.get<string>('CORS_EXPOSED_HEADERS', '').split(',').filter(h => h.trim()).map(h => h.trim()),
    maxAge: configService.get<number>('CORS_MAX_AGE', 86400), // 24 hours
  };
  
  app.enableCors(corsOptions);

   const config = new DocumentBuilder()
    .setTitle('Online shopping API')
    .setDescription('Online shopping app just practice for the drizzle and the react query')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
