import {Module} from '@nestjs/common';
import {AttributesService} from './service/attributes.service';
import {AttributesController} from './controller/attributes.controller';

@Module({
  providers: [AttributesService],
  controllers: [AttributesController],
})
export class AttributesModule {}
