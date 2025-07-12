import { Module } from '@nestjs/common';

import { OrderController } from '~/order/controller/order.controller';
import { OrderService } from '~/order/service/order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
