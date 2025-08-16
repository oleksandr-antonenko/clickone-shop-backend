import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './controller/customer.controller';
import { CustomerService } from './service/customer.service';
import { CustomerEntity } from './entities/customer.entity';
import { AddressEntity } from './entities/address.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AuthModule } from '../config/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity, AddressEntity, UserEntity]),
    AuthModule
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}


