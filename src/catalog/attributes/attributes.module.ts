import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductOptionValue } from '~/catalog/attributes/entity/attributes-option-value.entity';

import { AttributesController } from './controller/attributes.controller';
import { AttributesService } from './service/attributes.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOptionValue])],
  providers: [AttributesService],
  controllers: [AttributesController],
})
export class AttributesModule {}
