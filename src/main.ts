import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    { bufferLogs: true }
  );

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Security & Performance
  await app.register(helmet);
  await app.register(compression);
  
  app.enableCors({
    origin: '*', // Configure properly in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Config
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');

  // Global Pipes, Filters, Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  app.useGlobalFilters(
    new GlobalExceptionFilter(logger),
    new PrismaExceptionFilter(logger)
  );
  
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('FootballDB API')
    .setDescription('The official FootballDB Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful Shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
