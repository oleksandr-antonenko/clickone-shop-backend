import { Module } from '@nestjs/common';
import { CategoryController } from '~/category/category.controller';
import { CategoryService } from '~/category/category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
