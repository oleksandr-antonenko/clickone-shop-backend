import {
    Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { PublicRead } from '../../../common/decorators/public.decorator';
import { CategoryService } from '../service/category.service';
import { CheckPermission } from '~/admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '~/admin/entities/permission.entity';
import { PermissionGuard } from '~/admin/guards/permission.guard';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { FilterCategoryDto } from '../dto/filter-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@ApiTags('AI Categories')
@Controller('categories')
@ApiBearerAuth()
export class CategoryAIController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.CREATE)
  @ApiOperation({ 
    summary: 'Create a new category (Admin only)',
    description: 'Create a new product category in the system. Validates unique name and slug.'
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CreateCategoryDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Slug or name already exists'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin permissions required'
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category creation data. Name and slug must be unique.',
    examples: {
      'Basic Category': {
        summary: 'Create basic category',
        value: {
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic devices and gadgets',
          image: 'electronics.jpg',
          isActive: true,
          sortOrder: 1
        }
      },
      'Subcategory': {
        summary: 'Create subcategory',
        value: {
          name: 'Smartphones',
          slug: 'smartphones',
          description: 'Mobile phones and smartphones',
          image: 'smartphones.jpg',
          parentId: '1',
          isActive: true,
          sortOrder: 2
        }
      }
    }
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ 
    summary: 'Get all categories (Public)',
    description: 'Retrieve all product categories. Supports filtering by status and parent.'
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CreateCategoryDto]
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No categories found'
  })
  @ApiQuery({ 
    name: 'isActive', 
    type: Boolean, 
    required: false,
    description: 'Filter by active status'
  })
  @ApiQuery({ 
    name: 'parentId', 
    type: Number, 
    required: false,
    description: 'Filter by parent category ID'
  })
  findAll(@Query() filterCategoryDto: FilterCategoryDto) {
    return this.categoryService.findAll(filterCategoryDto);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ 
    summary: 'Get a category by ID (Public)',
    description: 'Retrieve a specific category by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CreateCategoryDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Category not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Category ID',
    example: '1'
  })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.UPDATE)
  @ApiOperation({ 
    summary: 'Update a category by ID (Admin only)',
    description: 'Update an existing category. Supports partial updates.'
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CreateCategoryDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Category not found'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Category was updated by another user'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin permissions required'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Category ID to update',
    example: '1'
  })
  @ApiBody({ 
    type: UpdateCategoryDto,
    description: 'Category update data. Only include fields to update.',
    examples: {
      'Update Name': {
        summary: 'Update category name',
        value: {
          name: 'Electronics Updated'
        }
      },
      'Update Multiple Fields': {
        summary: 'Update multiple fields',
        value: {
          name: 'Electronics Updated',
          description: 'Updated electronic devices and gadgets',
          isActive: true
        }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateCategory: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategory);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.DELETE)
  @ApiOperation({ 
    summary: 'Delete a category by ID (Admin only)',
    description: 'Permanently delete a category. This action cannot be undone.'
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category deleted successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid category ID'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Category not found'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin permissions required'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Category ID to delete',
    example: '1'
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
