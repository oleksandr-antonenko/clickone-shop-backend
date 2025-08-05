import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';

import { AuthModule } from './auth/auth.module';
import { AttributesModule } from './catalog/attributes/attributes.module';
import { BrandModule } from './catalog/brands/brand.module';
import { CategoryModule } from './catalog/category/category.module';
import { CollectionsModule } from './catalog/collections/collections.module';
import { FamiliesModule } from './catalog/families/families.module';
import { ProductModule } from './catalog/product/product.module';
import { SettingsModule } from './catalog/settings/settings.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthConfigService } from './config/auth.config';
import { getTypeOrmConfig } from './config/typeorm.config';
import { OrderModule } from './order/order.module';
import { CustomerModule } from './customer/customer.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRoot({
      ...getTypeOrmConfig(),
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
    CustomerModule,
    UserModule,
    AdminModule,
    InternalModule,
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
