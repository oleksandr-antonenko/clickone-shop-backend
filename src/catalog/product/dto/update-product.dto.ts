import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from '~/catalog/product/dto/create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
