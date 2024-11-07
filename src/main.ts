import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {setupSwagger} from './swagger';
import {PullerService} from './puller/puller.service';
import * as cookieParser from 'cookie-parser';
import {OffersService} from './offers/offers.service';
import {GeoService} from './geo/geo.service';
import {initializeIndices} from './indices';
import {DataSource} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {generateSiteMap} from './sitemap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (app.get(ConfigService).get('DROP_SCHEMA') === 'true') {
    initializeIndices(app.get(DataSource));
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  setupSwagger(app);

  app.get(PullerService).pull().catch(console.log);

  generateSiteMap(app).catch(console.log);

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
