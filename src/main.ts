import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { join } from 'path';
import { AppModule } from '~/app.module';
import { CategoryModule } from '~/catalog/category/category.module';

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

  const frontendConfig = new DocumentBuilder()
    .setTitle('Clickone Shop API - Frontend')
    .setVersion('1.0')
    .setDescription('API documentation for frontend developers. Simplified descriptions and examples for web and mobile applications.')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}/api`, 'Development server')
    .build();

  const frontendDocument = SwaggerModule.createDocument(app, frontendConfig, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('docs', app, frontendDocument, {
    customSiteTitle: 'Clickone Shop API - Frontend',
    customCss: '.swagger-ui .topbar { display: none }',
  });


  const aiConfig = new DocumentBuilder()
    .setTitle('Clickone Shop API - AI Integration')
    .setVersion('1.0')
    .setDescription('Comprehensive API documentation for AI integrations and automated systems. Includes detailed technical descriptions, error handling, validation rules, and business logic explanations. This documentation focuses on Categories module with detailed technical specifications.')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}/api`, 'Development server')
    .build();

  const aiDocument = SwaggerModule.createDocument(app, aiConfig, {
    ignoreGlobalPrefix: true,
    include: [CategoryModule],
  });

  SwaggerModule.setup('docs/ai', app, aiDocument, {
    customSiteTitle: 'Clickone Shop API - AI Integration (Categories Only)',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(PORT);
}

void bootstrap();
