import { PartialType, PickType } from '@nestjs/mapped-types';

import { CreateOrderDto } from '~/order/dto/create-order.dto';

export class UpdateOrderDto extends PartialType(
  PickType(CreateOrderDto, [
    'status',
    'paymentStatus',
    'paymentMethod',
    'trackingNumber',
    'adminNotes',
  ])
) {}
