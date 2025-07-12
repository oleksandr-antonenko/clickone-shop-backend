import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';

import { FamiliesController } from './controller/families.controller';
import { ProductFamily } from './entity/product-family.entity';
import { FamiliesService } from './service/families.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductFamily]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
