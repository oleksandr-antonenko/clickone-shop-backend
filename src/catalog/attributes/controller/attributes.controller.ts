import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { CreateAttributeDto } from '~/catalog/attributes/dto/atributes-option-values.dto';
import { ProductOptionValue } from '~/catalog/attributes/entity/attributes-option-value.entity';
import { AttributesService } from '~/catalog/attributes/service/attributes.service';
import { Product } from '~/catalog/product/entities/product.entity';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}
  @Get(':id')
  findOne(@Param() valueId: string) {
    return this.attributesService.findOne(valueId);
  }

  @Post()
  create(
    currentProduct: Product,
    @Body('attribute_option') creatingAttribute: CreateAttributeDto
  ): Promise<ProductOptionValue> {
    return this.attributesService.create(creatingAttribute, currentProduct);
  }
  @Delete(':id')
  delete(@Param() valueId: string) {
    return this.attributesService.delete(valueId);
  }
}
