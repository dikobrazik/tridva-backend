import {RequestMethod, ValidationPipe} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import {DataSource} from 'typeorm';
import {AppModule} from './app.module';
import {CategoryService} from './category/category.service';
import {initializeIndices} from './indices';
import {initializeAdmin} from './admin/initializeAdmin';
import {OffersService} from './offers/offers.service';
import {PullerService} from './puller/puller.service';
import {generateSiteMap} from './sitemap';
import {setupSwagger} from './swagger';
import {GeoPullerService} from './geo/geo-puller.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isDev = app.get(ConfigService).get('IS_DEV');

  if (app.get(ConfigService).get('DROP_SCHEMA') === 'true') {
    initializeIndices(app.get(DataSource));
  }

  app.setGlobalPrefix('api', {
    exclude: [
      {path: 'admin/(.*)', method: RequestMethod.GET},
      {path: 'admin/(.*)', method: RequestMethod.POST},
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({transform: true, transformOptions: {}}),
  );
  app.use(cookieParser());

  setupSwagger(app);

  app.get(PullerService).pull().catch(console.error);

  generateSiteMap(app).catch(console.error);

  await app.get(OffersService).preloadRandomOffersIds().catch(console.error);
  await app
    .get(CategoryService)
    .preparePopularCategoriesList()
    .catch(console.error);
  app.get(GeoPullerService).initialize().catch(console.error);

  app.enableCors({
    origin: isDev
      ? [
          'http://localhost',
          'http://localhost:3000',
          'http://158.160.12.140',
          'https://tridva.store',
        ]
      : ['https://tridva.store'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  initializeAdmin(app);

  await app.listen(80);
}

bootstrap();
