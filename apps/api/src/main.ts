import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DEFAULT_AUTH_COOKIE_NAME } from './auth/auth.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
    ],
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
