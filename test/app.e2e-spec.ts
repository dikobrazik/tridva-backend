import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/offers (GET)', async () => {
    await request(app.getHttpServer()).get('/offers').expect(200);
    // .expect({
    //   offers: expect.any(Array),
    //   total: expect.any(Number),
    //   pagesCount: expect.any(Number),
    // });
  });
});
