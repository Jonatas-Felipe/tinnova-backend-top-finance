/* eslint-disable @typescript-eslint/no-floating-promises */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './shared/infra/http/app';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: process.env.PORT || 3335,
    },
  });
  await app.listen();

  console.log("Microsserviço 'top-finance' está rodando na porta 3335");
}

bootstrap();
