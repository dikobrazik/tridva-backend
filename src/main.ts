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

  await app.listen(80);
}

bootstrap();
