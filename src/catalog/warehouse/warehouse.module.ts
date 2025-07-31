import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../product/entities/product.entity';
import { WarehouseController } from './controller/warehouse.controller';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseService } from './service/warehouse.service';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Product])],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
