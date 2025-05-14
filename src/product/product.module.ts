import { Module } from '@nestjs/common';
import { ProductController } from '~/product/product.controller';
import { ProductService } from '~/product/product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
