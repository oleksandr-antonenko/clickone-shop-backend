import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalController } from './controller/internal.controller';
import { InternalService } from './service/internal.service';
import { UserEntity } from '../user/entities/user.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CustomerEntity, Order])],
  controllers: [InternalController],
  providers: [InternalService],
  exports: [InternalService],
})
export class InternalModule {} 
 