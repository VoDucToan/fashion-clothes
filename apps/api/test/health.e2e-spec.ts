import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

/**
 * End-to-end tests boot the real Nest application (real DI graph, real HTTP
 * layer) and talk to it over HTTP. Liveness needs no database, so this suite
 * runs in CI without a Postgres container.
 */
describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health/live returns ok', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200);

    expect(response.body).toMatchObject({ status: 'ok' });
  });

  it('unknown routes return the standard error envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/nope')
      .expect(404);

    expect(response.body).toMatchObject({ statusCode: 404, path: '/api/nope' });
    expect(response.body.requestId).toBeDefined();
  });
});
