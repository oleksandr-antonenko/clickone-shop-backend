import { Module } from '@nestjs/common';
import { AttributesService } from './service/attributes.service';
import { AttributesController } from './controller/attributes.controller';
import { AttributesTypeController } from './controller/attributes-type.controller';
import { AttributesTypeService } from './service/attributes-type.service';
import { AttributesValueService } from './service/attributes-value.service';

@Module({
  providers: [AttributesService, AttributesTypeService, AttributesValueService],
  controllers: [AttributesController, AttributesTypeController],
})
export class AttributesModule {}
