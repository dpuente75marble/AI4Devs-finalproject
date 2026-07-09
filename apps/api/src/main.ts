import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DEFAULT_AUTH_COOKIE_NAME } from './auth/auth.constants';
import { resolveCorsOrigins } from './config/cors-origins.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: resolveCorsOrigins(process.env.CORS_ORIGINS),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('DeliveryOps AI API')
    .setDescription('AI-assisted delivery operations platform API')
    .setVersion('1.0')
    .addCookieAuth(DEFAULT_AUTH_COOKIE_NAME, {
      type: 'apiKey',
      in: 'cookie',
      description: 'HttpOnly session cookie set by POST /api/auth/login',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
