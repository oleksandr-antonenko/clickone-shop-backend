import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterService } from '../../filter/service/filter.service';
import { ProductController } from './controller/product.controller';
import { Product } from './entities/product.entity';
import { ProductService } from './service/product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService, FilterService],
  exports: [ProductService],
})
export class ProductModule {}
