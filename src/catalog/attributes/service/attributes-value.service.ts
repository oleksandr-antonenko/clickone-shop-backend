import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateAttributesValueDto } from '../dto/create-attributes-value.dto';
import { UpdateAttributesValueDto } from '../dto/update-attributes-value.dto';
import { AttributeValue } from '../entity/attributes-value.entity';

@Injectable()
export class AttributesValueService {
  constructor(
    @InjectRepository(AttributeValue)
    private attributeValueRepository: Repository<AttributeValue>
  ) {}

  private readonly logger = new Logger(AttributesValueService.name);

  async create(
    createAttributesValueDto: CreateAttributesValueDto
  ): Promise<AttributeValue> {
    try {
      const attributesValue = this.attributeValueRepository.create(
        createAttributesValueDto
      );

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
        relations: ['productOptionValues'],
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

  async findOne(id: number): Promise<AttributeValue> {
    try {
      const attributesValue = await this.attributeValueRepository.findOne({
        where: {
          id,
        },
        relations: ['productOptionValues'],
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
    id: number,
    updateAttributesValueDto: UpdateAttributesValueDto
  ): Promise<AttributeValue> {
    try {
      const attributeValue = await this.attributeValueRepository.findOneBy({
        id,
      });

      if (!attributeValue) {
        this.logger.warn(`Category with id ${id} not found`);
        throw new NotFoundException(
          `Attributes value  with ID ${id} not found`
        );
      }

      const updated = this.attributeValueRepository.merge(
        attributeValue,
        updateAttributesValueDto
      );

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

  async delete(id: number): Promise<{ message: string }> {
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
