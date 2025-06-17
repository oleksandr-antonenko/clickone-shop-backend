import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamiliesController } from './controller/families.controller';
import { ProductFamily } from './entity/product-family.entity';
import { Category } from '../category/entities/category.entity';
import { FamiliesService } from './service/families.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFamily, Category])],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
