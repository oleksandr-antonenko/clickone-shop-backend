import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from '~/order/dto/create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
