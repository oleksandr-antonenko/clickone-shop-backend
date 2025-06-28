import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttributesValueController } from './controller/attributes-value.controller';
import { AttributesController } from './controller/attributes.controller';
import { ProductOptionValue } from './entity/attributes-option-value.entity';
import { AttributeValue } from './entity/attributes-value.entity';
import { AttributesValueService } from './service/attributes-value.service';
import { AttributesService } from './service/attributes.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOptionValue, AttributeValue])],
  providers: [AttributesService, AttributesValueService],
  controllers: [AttributesController, AttributesValueController],
})
export class AttributesModule {}
