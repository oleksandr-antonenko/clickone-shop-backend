import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { CreateAttributeDto } from '~/catalog/attributes/dto/attributes-option-values.dto';
import { ProductOptionValue } from '~/catalog/attributes/entity/attributes-option-value.entity';
import { Product } from '~/catalog/product/entities/product.entity';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(ProductOptionValue)
    private readonly productOptionValue: Repository<ProductOptionValue>
  ) {}

  async findAll(productId: string) {
    try {
      const idNum = Number(productId);
      if (isNaN(idNum)) {
        throw new BadRequestException('productId must be a number');
      }

      const options = await this.productOptionValue.find({
        relations: {
          product: true,
          optionValue: true,
        },
        where: { product: { id: idNum } },
      });

      if (options.length === 0) {
        throw new NotFoundException('productOptions not found');
      }
      return options;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  async findOne(optionId: string, productId: string) {
    try {
      const productIdNum = Number(productId);
      if (isNaN(productIdNum)) {
        throw new BadRequestException('productId must be a number');
      }

      const optionIdNum = Number(optionId);
      if (isNaN(optionIdNum)) {
        throw new BadRequestException('optionId must be a number');
      }

      const productValue = await this.productOptionValue.findOne({
        relations: {
          product: true,
          optionValue: true,
        },
        where: { product: { id: productIdNum }, id: optionIdNum },
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

  async create(createAttribute: CreateAttributeDto, currentProductId: string) {
    try {
      const productOptionValueByValueId = await this.findOne(
        createAttribute.valueId,
        currentProductId
      );

      if (productOptionValueByValueId) {
        throw new BadRequestException('ID already exists');
      }

      const newProductOption = this.productOptionValue.create({
        ...createAttribute,
        valueId: createAttribute.valueId || nanoid(),
        product: { id: Number(currentProductId) } as Product,
      });

      return await this.productOptionValue.save(newProductOption);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async update(id: string, data: CreateAttributeDto, currentProductId: string) {
    const updatingOption = await this.findOne(id, currentProductId);
    if (!updatingOption) {
      throw new NotFoundException('updatingOption not found');
    }
    Object.assign(updatingOption, data);
    return await this.productOptionValue.save(updatingOption);
  }

  async delete(id: string, currentProductId: string) {
    const updatingOption = await this.findOne(id, currentProductId);
    if (!updatingOption) {
      throw new NotFoundException('deletingOption not found');
    }
    const deletedOption = await this.productOptionValue.delete({
      id: Number(id),
      product: { id: Number(currentProductId) },
    });
    return deletedOption;
  }
}
