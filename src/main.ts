import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {setupSwagger} from './swagger';
import {PullerService} from './puller/puller.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  setupSwagger(app);

  app.get(PullerService).pull();

  app.enableCors({
    origin: ['http://localhost:3000', 'http://158.160.12.140'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  });

  await app.listen(80);
}

bootstrap();
