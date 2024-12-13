import {RequestMethod} from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';
import passport from 'passport';
import session from 'express-session';
import {join} from 'path';
import {ConfigService} from '@nestjs/config';

export function initializeAdmin(app: NestExpressApplication) {
  app.setGlobalPrefix('api', {
    exclude: [
      {path: 'admin/(.*)', method: RequestMethod.GET},
      {path: 'admin/login', method: RequestMethod.POST},
    ],
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.setLocal('view options', {layout: 'main'});
  app.setLocal('layout', 'layouts/main');

  app.use(
    session({
      secret: app.get(ConfigService).getOrThrow('ADMIN_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(flash());
}
