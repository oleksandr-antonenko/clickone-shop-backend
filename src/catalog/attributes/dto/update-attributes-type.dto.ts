import { PartialType } from '@nestjs/swagger';
import { CreateAttributesTypeDto } from './create-attributes-type.dto';

export class UpdateAttributesTypeDto extends PartialType(
  CreateAttributesTypeDto,
) {}
