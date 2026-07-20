import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { configValidationSchema } from './config/config.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';

// Skeletons
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ImportModule } from './modules/import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production' 
          ? { target: 'pino-pretty' } 
          : undefined,
      },
    }),
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
