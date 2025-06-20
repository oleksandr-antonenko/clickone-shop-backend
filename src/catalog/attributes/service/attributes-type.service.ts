import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttributeType } from '../entity/attributes-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttributesTypeDto } from '../dto/create-attributes-type.dto';

@Injectable()
export class AttributesTypeService {
  constructor(
    @InjectRepository(AttributeType)
    private attributesTypeRepository: Repository<AttributeType>
  ) {}

  private async findTypeById(
    attributesTypeId?: number
  ): Promise<AttributeType | null> {
    if (!attributesTypeId) return null;

    const attributesType = await this.attributesTypeRepository.findOne({
      where: { id: attributesTypeId },
    });
    if (!attributesType) {
      throw new NotFoundException(`Type with ID ${attributesTypeId} not found`);
    }

    return attributesType;
  }

  async create(
    createAttributesTypeDto: CreateAttributesTypeDto
  ): Promise<AttributeType> {
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

  async findAll(): Promise<AttributeType[]> {
    try {
      return await this.attributesTypeRepository.find();
    } catch (error) {
      console.error('FindAllTypes error:', error);
      throw new BadRequestException('Failed to retrieve attributes types');
    }
  }

  async findOne(id: number): Promise<AttributeType> {
    try {
      const type = await this.attributesTypeRepository.findOneBy({ id });
      if (!type) {
        throw new BadRequestException('Attributes type not found');
      }
      return type;
    } catch (error) {
      console.error('FindTypeById error:', error);
      throw new BadRequestException('Failed to retrieve attributes type');
    }
  }

  async updateType(
    id: number,
    @Body() updateAttributesTypeDto: CreateAttributesTypeDto
  ): Promise<AttributeType> {
    const type = await this.findTypeById(id);
    if (!type) {
      throw new BadRequestException('Attributes type not found');
    }

    const updateDto = {
      name: updateAttributesTypeDto.name ?? type.name,
      slug: updateAttributesTypeDto.slug ?? type.slug,
    };

    const attributesType = this.attributesTypeRepository.create({
      ...updateDto,
    });

    const updated = this.attributesTypeRepository.merge(type, {
      ...attributesType,
    });

    try {
      return await this.attributesTypeRepository.save(updated);
    } catch (error) {
      console.error('UpdateAttributesType error:', error);
      throw new BadRequestException('Failed to update attributes type');
    }
  }

  async remove(id: number): Promise<void> {
    const type = await this.findTypeById(id);
    if (!type) {
      throw new BadRequestException('Attributes type not found');
    }

    try {
      await this.attributesTypeRepository.remove(type);
    } catch (error) {
      console.error('DeleteAttributesType error:', error);
      throw new BadRequestException('Failed to delete attributes type');
    }
  }
}
