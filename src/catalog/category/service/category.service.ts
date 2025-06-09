import {Injectable} from '@nestjs/common';
import {CreateCategoryDto} from '../dto/create-category.dto';
import {UpdateCategoryDto} from '../dto/update-category.dto';
import {FilterCategoryInterface} from '../interface/filter.interface';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Category} from '../entities/category.entity';
import {FastifyReply} from 'fastify';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}
  async create(createCategoryDto: CreateCategoryDto, res: FastifyReply) {
    try {
      const categoryBySlug = await this.categoryRepository.findOne({
        where: {slug: createCategoryDto.slug},
      });

      if (categoryBySlug) {
        return res.code(400).send({
          statusCode: 400,
          message: 'Slug already exists',
        });
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
      return res.code(400).send({
        statusCode: 400,
        message: error instanceof Error ? error.message : 'bad request',
      });
    }
  }

  async findAll(filterCategoryDto: FilterCategoryInterface, res: FastifyReply) {
    try {
      const {isActive, parentId} = filterCategoryDto;
      const query = this.categoryRepository.createQueryBuilder('category');
      if (isActive !== undefined) {
        query.andWhere('category.isActive = :isActive', {isActive});
      }
      if (parentId !== undefined) {
        query.andWhere('category.parentId = :parentId', {parentId});
      }

      const categories = await query.getMany();

      if (!categories.length) {
        return res.code(404).send({
          statusCode: 404,
          message: 'No categories found',
        });
      }
      return categories;
    } catch (error: unknown) {
      return res.code(400).send({
        statusCode: 400,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  async findOne(id: number, res: FastifyReply) {
    try {
      const category = await this.categoryRepository.findOne({where: {id}});
      if (!category) {
        return res.code(404).send({
          statusCode: 404,
          message: 'Category not found',
        });
      }
      return category;
    } catch (error: unknown) {
      return res.code(400).send({
        statusCode: 400,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  async update(
    id: number,
    updateCategory: UpdateCategoryDto,
    res: FastifyReply
  ): Promise<{message: string}> {
    try {
      const category = await this.categoryRepository.findOne({where: {id}});
      if (!category) {
        return res.code(404).send({
          statusCode: 404,
          message: 'Category not found',
        });
      }
      if (
        updateCategory.updatedAt &&
        new Date(updateCategory.updatedAt).getTime() !==
          new Date(category.updatedAt).getTime()
      ) {
        return res.code(409).send({
          statusCode: 409,
          message: 'This category has been updated. Please refresh the page.',
        });
      }

      const updateData = {
        ...updateCategory,
        parentId: updateCategory.parentId
          ? parseInt(updateCategory.parentId)
          : undefined,
      };

      await this.categoryRepository.update(id, updateData);
      return {message: 'Category updated successfully'};
    } catch (error: unknown) {
      return res.code(400).send({
        statusCode: 400,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  async remove(id: number, res: FastifyReply) {
    try {
      const removedCategory = await this.categoryRepository.findOne({
        where: {id},
      });
      if (!removedCategory) {
        return res.code(404).send({
          statusCode: 404,
          message: 'Category not found',
        });
      }
      await this.categoryRepository.delete(id);
      return {message: 'Category deleted successfully'};
    } catch (error: unknown) {
      return res.code(400).send({
        statusCode: 400,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }
}
