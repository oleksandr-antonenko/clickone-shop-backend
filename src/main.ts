import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '~/app.module';
import { CorsConfigService } from './config/cors.config';

const serverlessExpress = require('@vendia/serverless-express');

const isAiTag = (tag: string): boolean => /\bai\b/i.test(tag) || /AI Integration/i.test(tag);

const filterSwaggerDocument = (
  doc: any,
  options: { includeAi: boolean }
): any => {
  const shouldKeepOperation = (operation: any): boolean => {
    const tags: string[] = Array.isArray(operation?.tags) ? operation.tags : [];
    const hasAi = tags.some((t) => isAiTag(String(t)));
    return options.includeAi ? hasAi : !hasAi;
  };

  const filteredPaths: Record<string, any> = {};
  for (const [path, methods] of Object.entries<any>(doc.paths ?? {})) {
    const keptMethods: Record<string, any> = {};
    for (const [method, operation] of Object.entries<any>(methods)) {
      if (shouldKeepOperation(operation)) {
        keptMethods[method] = operation;
      }
    }
    if (Object.keys(keptMethods).length > 0) {
      filteredPaths[path] = keptMethods;
    }
  }

  const filteredTags = (doc.tags ?? []).filter((t: any) => {
    const name = typeof t === 'string' ? t : t?.name;
    const hasAi = isAiTag(String(name));
    return options.includeAi ? hasAi : !hasAi;
  });

  return {
    ...doc,
    paths: filteredPaths,
    tags: filteredTags,
  };
};

async function createApp(minimal: boolean): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  const corsConfig = new CorsConfigService();

  if (minimal) {
    
    app.enableCors({
      origin: corsConfig.getAllowedOrigins(),
      allowedHeaders: corsConfig.getAllowedHeaders(),
      methods: corsConfig.getAllowedMethods(),
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    const baseConfig = new DocumentBuilder()
      .setTitle('Clickone Shop Backend API')
      .setVersion('1.0')
      .setDescription('API for Clickone Shop Backend')
      .addBearerAuth()
      .build();

    const baseDocument = SwaggerModule.createDocument(app, baseConfig, {
      ignoreGlobalPrefix: false,
    });

    const publicDocument = filterSwaggerDocument(baseDocument, { includeAi: false });
    const aiDocument = filterSwaggerDocument(baseDocument, { includeAi: true });

    SwaggerModule.setup('docs', app, publicDocument, {
      customSiteTitle: 'Clickone Shop API',
    });

    SwaggerModule.setup('docs/ai', app, aiDocument, {
      customSiteTitle: 'Clickone Shop API - AI',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    
    await app.init();
    return app;
  }

  const PORT = process.env.PORT ?? 3310;

  app.enableCors({
    origin: corsConfig.getAllowedOrigins(),
    allowedHeaders: corsConfig.getAllowedHeaders(),
    methods: corsConfig.getAllowedMethods(),
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });



  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const baseConfig = new DocumentBuilder()
    .setTitle('Clickone Shop Backend API')
    .setVersion('1.0')
    .setDescription('API for Clickone Shop Backend')
    .addBearerAuth()
    .build();

  const baseDocument = SwaggerModule.createDocument(app, baseConfig, {
    ignoreGlobalPrefix: false,
  });

  const publicDocument = filterSwaggerDocument(baseDocument, { includeAi: false });
  const aiDocument = filterSwaggerDocument(baseDocument, { includeAi: true });

  SwaggerModule.setup('docs', app, publicDocument, {
    customSiteTitle: 'Clickone Shop API',
  });

  SwaggerModule.setup('docs/ai', app, aiDocument, {
    customSiteTitle: 'Clickone Shop API - AI',
  });

  await app.listen(PORT);
  return app;
}

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  void createApp(false);
}


export const handler = process.env.AWS_LAMBDA_FUNCTION_NAME
  ? async (event: any, context: any) => {
      context.callbackWaitsForEmptyEventLoop = false;
      const app = await createApp(true);
      const expressApp = app.getHttpAdapter().getInstance();
      const server = serverlessExpress({ app: expressApp });
      return server(event, context);
    }
  : undefined;