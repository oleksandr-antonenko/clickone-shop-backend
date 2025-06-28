import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { FilterCategoryInterface } from '../interface/filter.interface';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}
  private handleError(
    error: unknown,
    defaultMessage = 'An unexpected error occurred'
  ): never {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;

    this.logger.error(
      `CategoryService error: ${errorMessage}`,
      error instanceof Error ? error.stack : undefined
    );

    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    throw new BadRequestException(errorMessage);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const categoryBySlug = await this.categoryRepository.findOne({
        where: { slug: createCategoryDto.slug },
      });

      if (categoryBySlug) {
        throw new BadRequestException('Slug already exists');
      }

      const categoryData = {
        ...createCategoryDto,
        parentId: createCategoryDto.parentId
          ? parseInt(createCategoryDto.parentId)
          : undefined,
      };
      const category = this.categoryRepository.create(categoryData);

      return await this.categoryRepository.save(category);
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create category');
    }
  }

  async findAll(filterCategoryDto: FilterCategoryInterface) {
    try {
      const { isActive, parentId } = filterCategoryDto;
      const query = this.categoryRepository.createQueryBuilder('category');
      if (isActive !== undefined) {
        query.andWhere('category.isActive = :isActive', { isActive });
      }
      if (parentId !== undefined) {
        query.andWhere('category.parentId = :parentId', { parentId });
      }

      const categories = await query.getMany();

      if (!categories.length) {
        throw new NotFoundException('No categories found');
      }
      return categories;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch categories');
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException('Category id not found');
      }
      return category;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch category');
    }
  }

  async update(id: number, updateCategory: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException('Category id not found');
      }
      if (
        updateCategory.updatedAt &&
        new Date(updateCategory.updatedAt).getTime() !==
          new Date(category.updatedAt).getTime()
      ) {
        throw new ConflictException(
          'This category has been updated. Please refresh the page.'
        );
      }

      const updateData = {
        ...updateCategory,
        parentId: updateCategory.parentId
          ? parseInt(updateCategory.parentId)
          : undefined,
      };

      await this.categoryRepository.update(id, updateData);
      return { message: 'Category updated successfully' };
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update category');
    }
  }

  async remove(id: number) {
    try {
      const removedCategory = await this.categoryRepository.findOne({
        where: { id },
      });
      if (!removedCategory) {
        throw new NotFoundException('Category id not found');
      }
      await this.categoryRepository.delete(id);
      return { message: 'Category deleted successfully' };
    } catch (error: unknown) {
      this.handleError(error, 'Failed to delete category');
    }
  }
}
