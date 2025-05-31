import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './catalog/category/category.module';
import { ProductModule } from './catalog/product/product.module';
import { OrderModule } from './order/order.module';
import { AttributesModule } from './catalog/attributes/attributes.module';
import { SettingsModule } from './catalog/settings/settings.module';
import { FamiliesModule } from './catalog/families/families.module';

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
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
