import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';

import { AttributesController } from './controller/attributes.controller';
import { Attribute } from './entity/attribute.entity';
import { AttributesService } from './service/attributes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [AttributesController],
  providers: [AttributesService],
})
export class AttributesModule {}
