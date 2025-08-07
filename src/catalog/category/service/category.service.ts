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
      const nameRegex = /^[a-zA-Zа-яА-Я\s]+$/;
      if (!nameRegex.test(createCategoryDto.name)) {
        throw new BadRequestException('Category name must contain only letters (no numbers or special characters)');
      }

      const categoryBySlug = await this.categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(category.slug) = LOWER(:slug)', { slug: createCategoryDto.slug })
        .getOne();

      if (categoryBySlug) {
        throw new BadRequestException('Slug already exists');
      }

      const categoryByName = await this.categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(category.name) = LOWER(:name)', { name: createCategoryDto.name })
        .getOne();

      if (categoryByName) {
        throw new BadRequestException('Category name already exists');
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
      const categories = await this.categoryRepository.find({
        where: filterCategoryDto,
      });

      return categories;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch categories');
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });
      if (!category) {
        throw new NotFoundException('Category id not found');
      }
      return category;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch category');
    }
  }

  async update(id: string, updateCategory: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException('Category not found');
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

      if (updateCategory.slug) {
        const categoryBySlug = await this.categoryRepository
          .createQueryBuilder('category')
          .where('LOWER(category.slug) = LOWER(:slug)', { slug: updateCategory.slug })
          .andWhere('category.id != :id', { id })
          .getOne();

        if (categoryBySlug) {
          throw new BadRequestException('Slug already exists');
        }
      }

      if (updateCategory.name) {        
        const nameRegex = /^[a-zA-Zа-яА-Я\s]+$/;
        if (!nameRegex.test(updateCategory.name)) {
          throw new BadRequestException('Category name must contain only letters (no numbers or special characters)');
        }

        const categoryByName = await this.categoryRepository
          .createQueryBuilder('category')
          .where('LOWER(category.name) = LOWER(:name)', { name: updateCategory.name })
          .andWhere('category.id != :id', { id })
          .getOne();

        if (categoryByName) {
          throw new BadRequestException('Category name already exists');
        }
      }

      const updateData = {
        ...updateCategory,
        parentId: updateCategory.parentId
          ? parseInt(updateCategory.parentId)
          : undefined,
      };

      await this.categoryRepository.update(id, updateData);

      const updatedCategory = await this.categoryRepository.findOne({
        where: { id },
      });

      return updatedCategory;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update category');
    }
  }

  async remove(id: string) {
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
