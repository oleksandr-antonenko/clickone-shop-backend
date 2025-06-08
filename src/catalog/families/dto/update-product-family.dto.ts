import { PartialType } from '@nestjs/swagger';
import { CreateProductFamilyDto } from './create-product-family.dto';

export class UpdateProductFamilyDto extends PartialType(
  CreateProductFamilyDto,
) {}
