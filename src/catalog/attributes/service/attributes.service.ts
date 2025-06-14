import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOptionValue } from '~/catalog/attributes/entity/attributes-option-value.entity';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(ProductOptionValue)
    private readonly productOptionValue: Repository<ProductOptionValue>,
  ) {}
  async findOll(): Promise<ProductOptionValue[]> {}
}
