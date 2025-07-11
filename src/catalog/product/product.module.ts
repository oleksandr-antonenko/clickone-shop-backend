import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '../../filter/filter.module';
import { ProductController } from './controller/product.controller';
import { Product } from './entities/product.entity';
import { ProductService } from './service/product.service';
import { PaginationModule } from '../../pagination/pagination.module';
import { Category } from '../category/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Brand]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
