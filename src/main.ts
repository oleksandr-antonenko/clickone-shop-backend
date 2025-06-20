import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { AppModule } from '~/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ ignoreTrailingSlash: true }),
  );
  
  const PORT = process.env.PORT ?? 3310;

  await app.register(require('@fastify/cors'), {
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
  });

  await app.register(require('@fastify/static'), {
    root: process.cwd(),
    prefix: '/uploads/',
    constraints: { host: 'localhost' }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Clickone shop backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .setDescription('Description')
    .addServer(`http://localhost:${PORT}/api`, 'Development server')
    .addServer('https://...', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
}

void bootstrap();
