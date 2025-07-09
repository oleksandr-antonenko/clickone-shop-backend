import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';

import { CollectionsController } from './controller/collections.controller';
import { Collection } from './entity/collections.entity';
import { CollectionProduct } from './entity/collection-product.entity';
import { CollectionsService } from './service/collections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionProduct]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
