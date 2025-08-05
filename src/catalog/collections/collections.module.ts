import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';
import { AdminModule } from '~/admin/admin.module';
import { UserModule } from '~/user/user.module';

import { CollectionsController } from './controller/collections.controller';
import { CollectionProduct } from './entity/collection-product.entity';
import { Collection } from './entity/collections.entity';
import { CollectionsService } from './service/collections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionProduct]),
    FilterModule,
    PaginationModule,
    AdminModule,
    UserModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
