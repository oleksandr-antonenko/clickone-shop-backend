import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { FilterCategoryInterface } from '../interface/filter.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const categoryBySlug = await this.categoryRepository.findOne({ where: { slug: createCategoryDto.slug } });

      if(categoryBySlug) {
        throw new BadRequestException('Slug already exists');
      }
  
      const categoryData = {
        ...createCategoryDto,
        parentId: createCategoryDto.parentId ? parseInt(createCategoryDto.parentId) : undefined,
      }
      const category = this.categoryRepository.create(categoryData);
      
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

  }

  async findAll(filterCategoryDto: FilterCategoryInterface) {
    try {
      const categories = await this.categoryRepository.find({
        where: filterCategoryDto,
        relations: ['families']
      });
      
      if(!categories.length) {
        throw new NotFoundException('No categories found');
      }
      return categories;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({ 
        where: { id },
        relations: ['families']
      });
      if(!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, updateCategory: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if(!category) {
        throw new NotFoundException('Category not found');
      }
      if (updateCategory.updatedAt && new Date(updateCategory.updatedAt).getTime() !== new Date(category.updatedAt).getTime()) {
        throw new ConflictException('This category has been updated. Please refresh the page.');
      }
      

      const updateData = {
        ...updateCategory,
        parentId: updateCategory.parentId ? parseInt(updateCategory.parentId) : undefined,
      };
      
      await this.categoryRepository.update(id, updateData);
      return { message: 'Category updated successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const removedCategory = await this.categoryRepository.findOne({ where: { id } });
      if(!removedCategory) {
        throw new NotFoundException('Category not found');
      }
      await this.categoryRepository.delete(id);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
