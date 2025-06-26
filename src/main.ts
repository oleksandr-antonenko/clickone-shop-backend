import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { join } from 'path';
import { AppModule } from '~/app.module';

import { CorsConfigService } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT = process.env.PORT ?? 3310;

  const corsConfig = new CorsConfigService();

  app.enableCors({
    origin: corsConfig.getAllowedOrigins(),
    allowedHeaders: corsConfig.getAllowedHeaders(),
    methods: corsConfig.getAllowedMethods(),
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Static files serving
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Clickone Shop Backend API')
    .setVersion('1.0')
    .setDescription('API for Clickone Shop Backend')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}/api`, 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Clickone Shop API',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(PORT);
}

void bootstrap();
