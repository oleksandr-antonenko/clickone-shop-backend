import {
  Module,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';

import { AttributesModule } from './catalog/attributes/attributes.module';
import { BrandModule } from './catalog/brands/brand.module';
import { CategoryModule } from './catalog/category/category.module';
import { CollectionsModule } from './catalog/collections/collections.module';
import { FamiliesModule } from './catalog/families/families.module';
import { ProductModule } from './catalog/product/product.module';
import { SettingsModule } from './catalog/settings/settings.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthConfigService } from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      retryAttempts: 5,
      retryDelay: 3000,
    }),
    ProductModule,
    CategoryModule,
    OrderModule,
    AttributesModule,
    SettingsModule,
    FamiliesModule,
    CollectionsModule,
    CategoryModule,
    BrandModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
