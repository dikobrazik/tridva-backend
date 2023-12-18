import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {INestApplication} from '@nestjs/common';

export function setupSwagger(app: INestApplication<any>) {
  const config = app.get(ConfigService);

  if (true || config.get('IS_DEV')) {
    const config = new DocumentBuilder()
      .setTitle('Tridva')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }
}
