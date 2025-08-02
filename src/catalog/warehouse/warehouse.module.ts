import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';

import { Product } from '../product/entities/product.entity';
import { WarehouseController } from './controller/warehouse.controller';
import { WarehouseOperation } from './entities/warehouse-operation.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseService } from './service/warehouse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, Product, WarehouseOperation]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
