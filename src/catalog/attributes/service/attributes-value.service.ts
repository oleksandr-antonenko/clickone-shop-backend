import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttributeValue } from '../entity/attributes-value.entity';
import { AttributeType } from '../entity/attributes-type.entity';
import { CreateAttributesValueDto } from '../dto/create-attributes-value.dto';
import { UpdateAttributesValueDto } from '../dto/update-attributes-value.dto';
import { UpdateAttributesValue } from '../interface/updateAttributesValue.interface';

@Injectable()
export class AttributesValueService {
  constructor(
    @InjectRepository(AttributeValue)
    private attributeValueRepository: Repository<AttributeValue>,
    @InjectRepository(AttributeType)
    private attributeTypeRepository: Repository<AttributeType>
  ) {}

  private async findTypeById(
    attributesTypeId?: number
  ): Promise<AttributeType | null> {
    if (!attributesTypeId) return null;

    const attributesType = await this.attributeTypeRepository.findOne({
      where: { id: attributesTypeId },
    });
    if (!attributesType) {
      throw new NotFoundException(`Type with ID ${attributesTypeId} not found`);
    }

    return attributesType;
  }

  async create(createAttributesValueDto: CreateAttributesValueDto) {
    const type = await this.findTypeById(
      createAttributesValueDto.attributesTypeId
    );

    const attributesValue = this.attributeValueRepository.create({
      ...createAttributesValueDto,
      type: type ?? undefined,
    });

    try {
      return await this.attributeValueRepository.save(attributesValue);
    } catch (error) {
      console.error('createAttributesValue error:', error);
      throw new BadRequestException('Failed to create attributes value');
    }
  }

  async findAll() {
    return await this.attributeValueRepository.find({ relations: ['type'] });
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const attributesValue = await this.attributeValueRepository.findOne({
      where: {
        id,
      },
      relations: ['type'],
    });

    if (!attributesValue) {
      throw new NotFoundException(`Attributes value with ID ${id} not found`);
    }

    return attributesValue;
  }

  async update(id: number, @Body() formData: UpdateAttributesValueDto) {
    const value = await this.attributeValueRepository.findOne({
      where: { id },
    });

    if (!value)
      throw new NotFoundException(`Attributes value  with ID ${id} not found`);

    const attributesType = await this.findTypeById(formData.attributesTypeId);

    const updateDto: UpdateAttributesValue = {
      value: formData.value ?? value.value,
      hexCode: formData.hexCode ?? value.hex_code,
    };

    const attributesValue = this.attributeValueRepository.create({
      ...updateDto,
      type: attributesType ?? undefined,
    });

    const updated = this.attributeValueRepository.merge(value, {
      ...attributesValue,
    });

    try {
      return await this.attributeValueRepository.save(updated);
    } catch (error) {
      console.error('UpdateAttributesValue  error:', error);
      throw new BadRequestException('Failed to update attributes value');
    }
  }

  async delete(id: number) {
    const attributeValue = await this.attributeValueRepository.findOne({
      where: { id },
    });

    if (!attributeValue)
      throw new NotFoundException(`Attributes value  with ID ${id} not found`);
    await this.attributeValueRepository.delete(id);

    return { message: 'Attributes value deleted successfully' };
  }
}
