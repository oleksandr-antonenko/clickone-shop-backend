import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '~/catalog/product/entities/product.entity';
import { FilterModule } from '~/filter/filter.module';
import { OrderController } from '~/order/controller/order.controller';
import { OrderService } from '~/order/service/order.service';
import { PaginationModule } from '~/pagination/pagination.module';

import { Address } from './entities/address.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Address, Product]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
