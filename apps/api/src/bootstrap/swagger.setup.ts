import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Interactive API docs at /docs. Enabled in dev, switched off in production
 * through SWAGGER_ENABLED — a public schema of every admin endpoint is free
 * reconnaissance for an attacker.
 */
export function setupSwagger(app: INestApplication, path: string): void {
  const config = new DocumentBuilder()
    .setTitle('Fashion Clothes API')
    .setDescription(
      'Storefront and admin API for the fashion e-commerce project',
    )
    .setVersion('1.0')
    .addCookieAuth('refresh_token')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
