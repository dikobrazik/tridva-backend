import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {setupSwagger} from './swagger';
import {PullerService} from './puller/puller.service';
import * as cookieParser from 'cookie-parser';
import {OffersService} from './offers/offers.service';
import {GeoService} from './geo/geo.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  setupSwagger(app);

  app.get(PullerService).pull().catch(console.log);

  await app.get(OffersService).preloadRandomOffersIds().catch(console.log);
  app.get(GeoService).initialize().catch(console.log);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://158.160.12.140',
      'http://tridva.store',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  await app.listen(80);
}

bootstrap();
