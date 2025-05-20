if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}
import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { AppModule } from '~/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ ignoreTrailingSlash: true }),
  );

  const PORT = process.env.PORT ?? 3310;

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
