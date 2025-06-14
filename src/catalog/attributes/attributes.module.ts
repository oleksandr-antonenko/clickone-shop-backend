import { Module } from '@nestjs/common';
import { AttributesService } from './service/attributes.service';
import { AttributesController } from './controller/attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOptionValue } from '~/catalog/attributes/entity/attributes-option-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOptionValue])],
  providers: [AttributesService],
  controllers: [AttributesController],
})
export class AttributesModule {}
