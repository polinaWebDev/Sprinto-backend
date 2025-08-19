import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'node:fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.time('App bootstrap time');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser(configService.get('JWT_SECRET')));

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('HeadHunter API')
    .setDescription('Head Hunter API')
    .setVersion('1.0')
    .addCookieAuth('accessToken', {
      description: 'JWT access token',
      name: 'accessToken',
      type: 'apiKey',
      in: 'cookie',
    })
    .addCookieAuth('refreshToken', {
      description: 'JWT refresh token',
      name: 'refreshToken',
      type: 'apiKey',
      in: 'cookie',
    })
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  fs.writeFileSync('public/openapi.json', JSON.stringify(document, null, 2));

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () =>
    console.log(`Server started on http://localhost:${PORT}`),
  );
  console.timeEnd('App bootstrap time');
}
bootstrap();
