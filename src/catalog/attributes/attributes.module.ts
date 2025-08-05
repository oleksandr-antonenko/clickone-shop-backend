import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';
import { AdminModule } from '~/admin/admin.module';
import { UserModule } from '~/user/user.module';

import { AttributesController } from './controller/attributes.controller';
import { AttributeOption } from './entity/attribute-options.entity';
import { Attribute } from './entity/attribute.entity';
import { AttributesService } from './service/attributes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, AttributeOption]),
    FilterModule,
    PaginationModule,
    AdminModule,
    UserModule,
  ],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
