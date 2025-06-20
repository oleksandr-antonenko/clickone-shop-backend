import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { CreateAttributeDto } from '~/catalog/attributes/dto/atributes-option-values.dto';
import { ProductOptionValue } from '~/catalog/attributes/entity/attributes-option-value.entity';
import { Product } from '~/catalog/product/entities/product.entity';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(ProductOptionValue)
    private readonly productOptionValue: Repository<ProductOptionValue>
  ) {}

  async findOne(valueId: string) {
    try {
      const productValue = await this.productOptionValue.findOne({
        where: { valueId },
      });
      if (!productValue) {
        throw new NotFoundException('productValue not found');
      }
      return productValue;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  async create(createAttribute: CreateAttributeDto, currentProduct: Product) {
    try {
      const productOptionValueById = await this.findOne(
        createAttribute.valueId
      );

      if (productOptionValueById) {
        throw new BadRequestException('ID already exists');
      }

      const newProductOption = this.productOptionValue.create({
        ...createAttribute,
        valueId: createAttribute.valueId || nanoid(),
        product: currentProduct,
      });

      return await this.productOptionValue.save(newProductOption);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async delete(id: string) {
    const deletedOption = await this.productOptionValue.delete({
      valueId: id,
    });
    return deletedOption;
  }
}
