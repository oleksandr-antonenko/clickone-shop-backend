import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '../../filter/filter.module';
import { PaginationModule } from '../../pagination/pagination.module';
import { Attribute } from '../attributes/entity/attribute.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../category/entities/category.entity';
import { ProductFamily } from '../families/entity/product-family.entity';
import { ProductController } from './controller/product.controller';
import { Product } from './entities/product.entity';
import { ProductService } from './service/product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      ProductFamily,
      Brand,
      Attribute,
    ]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
