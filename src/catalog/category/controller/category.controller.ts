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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PublicRead } from '../../../common/decorators/public.decorator';
import { PermissionGuard } from '~/admin/guards/permission.guard';
import { CheckPermission } from '~/admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '~/admin/entities/permission.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { FilterCategoryDto } from '../dto/filter-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryService } from '../service/category.service';

@ApiTags('Categories')
@Controller('category')
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      'example 1': {
        value: {
          name: 'Category 1',
          slug: 'category-1',
          description: 'Description of category 1',
          image: 'image.jpg',
          parentId: '1',
          isActive: true,
          sortOrder: 1,
        },
      },
    },
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all categories (Public)' })
  @ApiResponse({
    status: 200,
    description: 'The categories have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Categories not found.' })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiQuery({ name: 'parentId', type: Number, required: false })
  findAll(@Query() filterCategoryDto: FilterCategoryDto) {
    return this.categoryService.findAll(filterCategoryDto);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get a category by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID', example: 1 })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update a category by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Category ID', example: 1 })
  @ApiBody({ type: UpdateCategoryDto })
  update(@Param('id') id: string, @Body() updateCategory: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategory);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete a category by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Category ID', example: 1 })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
