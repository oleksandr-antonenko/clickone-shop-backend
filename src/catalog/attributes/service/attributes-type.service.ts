import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  NotFoundException,
  Param,
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

  private readonly logger = new Logger(AttributesTypeService.name);

  async create(
    @Body()
    createAttributesTypeDto: CreateAttributesTypeDto
  ): Promise<AttributeType> {
    try {
      const createAttributesType = this.attributesTypeRepository.create({
        ...createAttributesTypeDto,
      });

      return await this.attributesTypeRepository.save(createAttributesType);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `CreateAttributesType error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to create attributes type');
    }
  }

  async findAll(): Promise<AttributeType[]> {
    try {
      return await this.attributesTypeRepository.find({
        relations: ['values'],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindAllAttributesTypes error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to retrieve attributes types');
    }
  }

  async findOne(@Param('id') id: number): Promise<AttributeType> {
    try {
      const attributesType = await this.attributesTypeRepository.findOne({
        where: {
          id,
        },
        relations: ['values'],
      });
      if (!attributesType) {
        throw new BadRequestException(
          `Attributes type with ID ${id} not found`
        );
      }
      return attributesType;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindOneAttributesType error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to retrieve attributes type');
    }
  }

  async update(
    @Param('id') id: number,
    @Body() updateAttributesTypeDto: CreateAttributesTypeDto
  ): Promise<AttributeType> {
    const type = await this.attributesTypeRepository.findOne({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException(`Attributes type  with ID ${id} not found`);
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
      const err = error as Error;
      this.logger.error(
        `UpdateAttributesType error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to update attributes type');
    }
  }

  async remove(@Param('id') id: number): Promise<{ message: string }> {
    try {
      const attributesType = await this.attributesTypeRepository.findOne({
        where: { id },
      });

      if (!attributesType) {
        throw new NotFoundException(`Attributes type  with ID ${id} not found`);
      }

      await this.attributesTypeRepository.remove(attributesType);

      return { message: 'Attributes value deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `RemoveAttributesType error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to delete attributes type');
    }
  }
}
