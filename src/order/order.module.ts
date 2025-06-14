import { Module } from '@nestjs/common';

import { OrderController } from '~/order/order.controller';
import { OrderService } from '~/order/order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
