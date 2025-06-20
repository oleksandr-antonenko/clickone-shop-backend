import { PartialType } from '@nestjs/swagger';
import { CreateAttributesValueDto } from './create-attributes-value.dto';

export class UpdateAttributesValueDto extends PartialType(
  CreateAttributesValueDto
) {}
