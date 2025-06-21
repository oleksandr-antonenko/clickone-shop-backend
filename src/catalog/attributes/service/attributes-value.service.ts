import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  NotFoundException,
  Param,
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

  private readonly logger = new Logger(AttributesValueService.name);

  private async findTypeById(
    attributesTypeId?: number
  ): Promise<AttributeType | null> {
    if (!attributesTypeId) return null;

    try {
      const attributesType = await this.attributeTypeRepository.findOne({
        where: { id: attributesTypeId },
      });
      if (!attributesType) {
        throw new NotFoundException(
          `Type with ID ${attributesTypeId} not found`
        );
      }

      return attributesType;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindTypeById error with ID ${attributesTypeId}: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find category');
    }
  }

  async create(
    @Body() createAttributesValueDto: CreateAttributesValueDto
  ): Promise<AttributeValue> {
    try {
      const type = await this.findTypeById(
        createAttributesValueDto.attributesTypeId
      );

      const attributesValue = this.attributeValueRepository.create({
        ...createAttributesValueDto,
        type: type ?? undefined,
      });

      return await this.attributeValueRepository.save(attributesValue);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `CreateAttributesValue error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to create attributes value');
    }
  }

  async findAll(): Promise<AttributeValue[]> {
    try {
      return await this.attributeValueRepository.find({
        relations: ['type', 'productOptionValues'],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindAllAttributesValues error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find attributes values');
    }
  }

  async findOne(@Param('id') id: number): Promise<AttributeValue> {
    try {
      const attributesValue = await this.attributeValueRepository.findOne({
        where: {
          id,
        },
        relations: ['type', 'productOptionValues'],
      });

      if (!attributesValue) {
        throw new NotFoundException(`Attributes value with ID ${id} not found`);
      }

      return attributesValue;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindOneAttributesValue error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find attributes values');
    }
  }

  async update(
    @Param('id') id: number,
    @Body() updateAttributesValueDto: UpdateAttributesValueDto
  ): Promise<AttributeValue> {
    try {
      const attributeValue = await this.attributeValueRepository.findOne({
        where: { id },
      });

      if (!attributeValue)
        throw new NotFoundException(
          `Attributes value  with ID ${id} not found`
        );

      const attributesType = await this.findTypeById(
        updateAttributesValueDto.attributesTypeId
      );

      const updateDto: UpdateAttributesValue = {
        value: updateAttributesValueDto.value ?? attributeValue.value,
        hexCode: updateAttributesValueDto.hexCode ?? attributeValue.hex_code,
      };

      const attributesValue = this.attributeValueRepository.create({
        ...updateDto,
        type: attributesType ?? undefined,
      });

      const updated = this.attributeValueRepository.merge(attributeValue, {
        ...attributesValue,
      });

      return await this.attributeValueRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `UpdateAttributesValue error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to update attributes value');
    }
  }

  async delete(@Param('id') id: number): Promise<{ message: string }> {
    try {
      const attributeValue = await this.attributeValueRepository.findOne({
        where: { id },
      });

      if (!attributeValue)
        throw new NotFoundException(
          `Attributes value  with ID ${id} not found`
        );

      await this.attributeValueRepository.remove(attributeValue);

      return { message: 'Attributes value deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `RemoveAttributesValue error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to delete attributes value');
    }
  }
}
