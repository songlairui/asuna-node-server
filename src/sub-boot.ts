import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './microservices/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: { retryAttempts: 5, retryDelay: 3000, port: 34567 },
  });
  await app.listenAsync();
}
bootstrap();
