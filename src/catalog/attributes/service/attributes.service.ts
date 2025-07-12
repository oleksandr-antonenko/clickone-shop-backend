import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import { Attribute } from '../entity/attribute.entity';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributesRepository: Repository<Attribute>
  ) {}

  private readonly logger = new Logger(AttributesService.name);

  async create(
    createAttributesValueDto: CreateAttributeDto
  ): Promise<Attribute> {
    try {
      const attributesValue = this.attributesRepository.create(
        createAttributesValueDto
      );

      return await this.attributesRepository.save(attributesValue);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`CreateAttribute error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to create attribute');
    }
  }

  async findAll(): Promise<Attribute[]> {
    try {
      return await this.attributesRepository.find({
        relations: ['product'],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindAllAttributes error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find attributes');
    }
  }

  async findOne(id: number): Promise<Attribute> {
    try {
      const attributesValue = await this.attributesRepository.findOne({
        where: {
          id,
        },
        relations: ['product'],
      });

      if (!attributesValue) {
        throw new NotFoundException('Attribute not found');
      }

      return attributesValue;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindOneAttribute error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find attribute');
    }
  }

  async update(
    id: number,
    updateAttributesValueDto: UpdateAttributeDto
  ): Promise<Attribute> {
    try {
      const attributeValue = await this.attributesRepository.findOneBy({
        id,
      });

      if (!attributeValue) {
        this.logger.warn('Attribute not found');
        throw new NotFoundException('Attribute not found');
      }

      const updated = this.attributesRepository.merge(
        attributeValue,
        updateAttributesValueDto
      );

      return await this.attributesRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`UpdateAttribute error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to update attribute');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const attributeValue = await this.attributesRepository.findOne({
        where: { id },
      });

      if (!attributeValue) throw new NotFoundException('Attribute not found');

      await this.attributesRepository.remove(attributeValue);

      return { message: 'Attribute deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`RemoveAttribute error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to delete attribute');
    }
  }
}
