import { Module } from '@nestjs/common';

import { AttributesController } from './controller/attributes.controller';
import { AttributesTypeController } from './controller/attributes-type.controller';
import { AttributesTypeService } from './service/attributes-type.service';
import { AttributesValueService } from './service/attributes-value.service';
import { AttributesValueController } from './controller/attributes-value.controller';
import { AttributesService } from './service/attributes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOptionValue } from './entity/attributes-option-value.entity';
import { AttributeValue } from './entity/attributes-value.entity';
import { AttributeType } from './entity/attributes-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductOptionValue,
      AttributeType,
      AttributeValue,
    ]),
  ],
  providers: [AttributesService, AttributesTypeService, AttributesValueService],
  controllers: [
    AttributesController,
    AttributesTypeController,
    AttributesValueController,
  ],
})
export class AttributesModule {}
