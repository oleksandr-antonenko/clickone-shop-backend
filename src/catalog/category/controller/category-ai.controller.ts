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
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PublicRead } from '../../../common/decorators/public.decorator';
import { PermissionGuard } from '~/admin/guards/permission.guard';
import { CheckPermission } from '~/admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '~/admin/entities/permission.entity';
import { ApiOperationAI, ApiResponseAI, ApiBodyAI } from '~/common/decorators/swagger.decorators';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { FilterCategoryDto } from '../dto/filter-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryService } from '../service/category.service';

@ApiTags('Categories - AI Integration')
@Controller('categories')
@ApiBearerAuth()
export class CategoryAIController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.CREATE)
  @ApiOperationAI(
    'Create a new category (Admin only)',
    'Create a new product category in the system. This endpoint validates that both the name and slug are unique (case-insensitive) before creating the category. The name field must contain only letters (no numbers or special characters) - only alphabetic characters and spaces are allowed. The parentId is optional and can be used to create hierarchical category structures. If parentId is provided, it will be converted to an integer. This endpoint is protected and requires admin permissions. The category will be created with the provided data and returned with all fields including the generated ID and timestamps. The system performs comprehensive validation including slug uniqueness, name uniqueness, letter-only validation, and proper data type conversion for hierarchical relationships.'
  )
  @ApiResponseAI(
    201,
    'Category created successfully. Returns the complete category object with ID, timestamps, and all provided fields. The response includes all category metadata and hierarchical information.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        name: { type: 'string', example: 'Electronics' },
        slug: { type: 'string', example: 'electronics' },
        description: { type: 'string', example: 'Electronic devices and gadgets' },
        image: { type: 'string', example: 'electronics.jpg' },
        parentId: { type: 'number', example: null },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  )
  @ApiResponseAI(
    400,
    'Bad Request - Slug already exists, category name already exists, invalid name format, or invalid input data. Both the slug and name must be unique across all categories (case-insensitive). The name field must contain only letters (no numbers or special characters). The system performs case-insensitive validation using PostgreSQL LOWER() function and letter-only validation using regex pattern. Check the request body format and ensure all required fields are provided correctly. Validation errors include duplicate slug/name detection, letter-only validation, and data type validation.'
  )
  @ApiResponseAI(
    401,
    'Unauthorized - Authentication token is missing, invalid, or expired. User must be logged in with admin permissions. The endpoint requires a valid JWT token with admin role.'
  )
  @ApiResponseAI(
    403,
    'Forbidden - User does not have sufficient permissions to create categories. Admin role required. The PermissionGuard validates user permissions against the ResourceType.CATEGORIES with PermissionAction.CREATE.'
  )
  @ApiBodyAI(
    CreateCategoryDto,
    'Category creation data. Both the slug and name fields must be unique across all categories (case-insensitive). The name field must contain only letters (no numbers or special characters) - only alphabetic characters and spaces are allowed. The system uses PostgreSQL LOWER() function for case-insensitive validation and regex pattern for letter-only validation. parentId is optional and creates hierarchical structure. The parentId will be converted to integer if provided. All fields are validated before processing.',
    {
      'Basic Category': {
        summary: 'Create basic category',
        description: 'Create a simple category without parent',
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
        description: 'Create a category with parent (subcategory)',
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
  )
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @PublicRead()
  @ApiOperationAI(
    'Get all categories (Public)',
    'Retrieve all product categories from the system. This endpoint is publicly accessible and does not require authentication. Categories can be filtered by isActive status and parentId. If no filters are provided, all categories are returned. The response includes all category fields including hierarchical relationships through parentId. This endpoint is used by the frontend to display category navigation and product filtering options. The system supports flexible filtering and returns complete category metadata.'
  )
  @ApiResponseAI(
    200,
    'Categories retrieved successfully. Returns an array of category objects with complete information including hierarchical structure. Each category includes all metadata fields and relationship information.',
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          name: { type: 'string', example: 'Electronics' },
          slug: { type: 'string', example: 'electronics' },
          description: { type: 'string', example: 'Electronic devices and gadgets' },
          image: { type: 'string', example: 'electronics.jpg' },
          parentId: { type: 'number', example: null },
          isActive: { type: 'boolean', example: true },
          sortOrder: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
        }
      }
    }
  )
  @ApiResponseAI(
    404,
    'No categories found matching the provided filters. This may happen if all categories are inactive or if parentId filter returns no results. The system returns 404 when the filter criteria produce no matches.'
  )
  @ApiQuery({ 
    name: 'isActive', 
    type: Boolean, 
    required: false,
    description: 'Filter categories by active status. If true, returns only active categories. If false, returns only inactive categories. If not provided, returns all categories.'
  })
  @ApiQuery({ 
    name: 'parentId', 
    type: Number, 
    required: false,
    description: 'Filter categories by parent ID. Returns only subcategories of the specified parent category. If null, returns only top-level categories.'
  })
  findAll(@Query() filterCategoryDto: FilterCategoryDto) {
    return this.categoryService.findAll(filterCategoryDto);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperationAI(
    'Get a category by ID (Public)',
    'Retrieve a specific product category by its unique ID. This endpoint is publicly accessible and does not require authentication. Returns complete category information including all fields and metadata. If the category is not found, a 404 error is returned. This endpoint is used by the frontend to display detailed category information and for category-specific product listings. The system performs ID validation and returns comprehensive category data.'
  )
  @ApiResponseAI(
    200,
    'Category retrieved successfully. Returns the complete category object with all fields and metadata. Includes hierarchical information and relationship data.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        name: { type: 'string', example: 'Electronics' },
        slug: { type: 'string', example: 'electronics' },
        description: { type: 'string', example: 'Electronic devices and gadgets' },
        image: { type: 'string', example: 'electronics.jpg' },
        parentId: { type: 'number', example: null },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  )
  @ApiResponseAI(
    404,
    'Category not found. The specified category ID does not exist in the system. Check the ID parameter and ensure it is correct. The system performs ID validation before returning category data.'
  )
  @ApiParam({ 
    name: 'id', 
    description: 'Unique category identifier. Must be a valid category ID that exists in the system.',
    example: '1'
  })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.UPDATE)
  @ApiOperationAI(
    'Update a category by ID (Admin only)',
    'Update an existing product category by its ID. This endpoint validates that the category exists before updating. The update includes optimistic concurrency control - if the updatedAt timestamp does not match the current category timestamp, the update is rejected to prevent conflicts. If name or slug are being updated, they are validated for uniqueness (case-insensitive) against other categories. The name field must contain only letters (no numbers or special characters) - only alphabetic characters and spaces are allowed. The parentId field is optional and will be converted to an integer if provided. This endpoint is protected and requires admin permissions. Only the fields provided in the request body will be updated. The system performs comprehensive validation including conflict detection, letter-only validation, and data integrity checks.'
  )
  @ApiResponseAI(
    200,
    'Category updated successfully. Returns the complete updated category object with all fields and new timestamps. The response includes updated metadata and relationship information.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        name: { type: 'string', example: 'Electronics Updated' },
        slug: { type: 'string', example: 'electronics-updated' },
        description: { type: 'string', example: 'Updated electronic devices and gadgets' },
        image: { type: 'string', example: 'electronics-updated.jpg' },
        parentId: { type: 'number', example: null },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:30:00.000Z' }
      }
    }
  )
  @ApiResponseAI(
    400,
    'Bad Request - Invalid input data, invalid name format, or optimistic concurrency conflict. The name field must contain only letters (no numbers or special characters). Check the request body format and ensure all field validations pass. If updatedAt timestamp conflict occurs, refresh the page and try again. The system validates data integrity, letter-only validation, and conflict resolution.'
  )
  @ApiResponseAI(
    404,
    'Category not found. The specified category ID does not exist in the system. Check the ID parameter and ensure it is correct.'
  )
  @ApiResponseAI(
    409,
    'Conflict - This category has been updated by another user. Please refresh the page and try again. This prevents concurrent modification conflicts. The optimistic concurrency control prevents data corruption.'
  )
  @ApiResponseAI(
    401,
    'Unauthorized - Authentication token is missing, invalid, or expired. User must be logged in with admin permissions.'
  )
  @ApiResponseAI(
    403,
    'Forbidden - User does not have sufficient permissions to update categories. Admin role required.'
  )
  @ApiParam({ 
    name: 'id', 
    description: 'Unique category identifier to update. Must be a valid category ID that exists in the system.',
    example: '1'
  })
  @ApiBodyAI(
    UpdateCategoryDto,
    'Category update data. Only include the fields you want to update. All fields are optional. The name field must contain only letters (no numbers or special characters) - only alphabetic characters and spaces are allowed. The parentId will be converted to integer if provided. The system performs case-insensitive validation for name and slug uniqueness and letter-only validation for name format.',
    {
      'Update Name': {
        summary: 'Update category name',
        description: 'Update only the category name',
        value: {
          name: 'Electronics Updated'
        }
      },
      'Update Multiple Fields': {
        summary: 'Update multiple fields',
        description: 'Update name, description, and active status',
        value: {
          name: 'Electronics Updated',
          description: 'Updated electronic devices and gadgets',
          isActive: true
        }
      },
      'Change Parent': {
        summary: 'Change category parent',
        description: 'Move category to different parent',
        value: {
          parentId: '2'
        }
      }
    }
  )
  update(@Param('id') id: string, @Body() updateCategory: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategory);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.CATEGORIES, PermissionAction.DELETE)
  @ApiOperationAI(
    'Delete a category by ID (Admin only)',
    'Permanently delete a product category by its ID. This action cannot be undone. The endpoint first validates that the category exists before deletion. If the category is successfully deleted, a confirmation message is returned. This endpoint is protected and requires admin permissions. Use with caution as this will remove the category and may affect products associated with it. The system performs existence validation and permanent removal.'
  )
  @ApiResponseAI(
    200,
    'Category deleted successfully. Returns a confirmation message. The category has been permanently removed from the system.',
    {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Category deleted successfully',
          description: 'Confirmation message indicating successful deletion'
        }
      }
    }
  )
  @ApiResponseAI(
    400,
    'Bad Request - Invalid category ID or deletion failed. Check the ID parameter and ensure it is correct.'
  )
  @ApiResponseAI(
    404,
    'Category not found. The specified category ID does not exist in the system. Check the ID parameter and ensure it is correct.'
  )
  @ApiResponseAI(
    401,
    'Unauthorized - Authentication token is missing, invalid, or expired. User must be logged in with admin permissions.'
  )
  @ApiResponseAI(
    403,
    'Forbidden - User does not have sufficient permissions to delete categories. Admin role required.'
  )
  @ApiParam({ 
    name: 'id', 
    description: 'Unique category identifier to delete. Must be a valid category ID that exists in the system.',
    example: '1'
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
} 