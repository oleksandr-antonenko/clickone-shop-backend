import { Module } from '@nestjs/common';

import { AttributesController } from './controller/attributes.controller';
import { AttributesService } from './service/attributes.service';

@Module({
  providers: [AttributesService],
  controllers: [AttributesController],
})
export class AttributesModule {}
