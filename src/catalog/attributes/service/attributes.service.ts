import { BadRequestException, Injectable } from '@nestjs/common';
import { AttributeType } from '../entity/attributes-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttributesTypeDto } from '../dto/create-attributes-type.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(AttributeType)
    private attributesTypeRepository: Repository<AttributeType>,
  ) {}

  async createType(createAttributesTypeDto: CreateAttributesTypeDto) {
    const createAttributesType = this.attributesTypeRepository.create({
      ...createAttributesTypeDto,
    });

    try {
      return await this.attributesTypeRepository.save(createAttributesType);
    } catch (error) {
      console.error('CreateProductFamily error:', error);
      throw new BadRequestException('Failed to create attributes type');
    }
  }
}
