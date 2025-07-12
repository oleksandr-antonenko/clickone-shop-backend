import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../product/entities/product.entity';
import { AttributesController } from './controller/attributes.controller';
import { Attribute } from './entity/attribute.entity';
import { AttributesService } from './service/attributes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, Product])],
  controllers: [AttributesController],
  providers: [AttributesService],
})
export class AttributesModule {}
