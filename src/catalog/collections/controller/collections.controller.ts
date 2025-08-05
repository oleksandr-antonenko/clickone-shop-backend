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

import { PublicRead } from '~/common/decorators/public.decorator';
import { PermissionGuard } from '~/admin/guards/permission.guard';
import { CheckPermission } from '~/admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '~/admin/entities/permission.entity';

import {
  AddProductsToCollectionDto,
  RemoveProductsFromCollectionDto,
  UpdateProductOrderDto,
} from '../dto/collection-product.dto';
import { CollectionProductsPaginationDto } from '../dto/collection-products-pagination.dto';
import { CollectionsDto } from '../dto/collections.dto';
import { PaginationQueryCollectionDto } from '../dto/pagination-query-collection.dto';
import { CollectionsService } from '../service/collections.service';

@ApiTags('Collections')
@Controller('collections')
@ApiBearerAuth()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new collection (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Collection created successfully',
    type: CollectionsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CollectionsDto })
  async create(@Body() createCollectionDto: CollectionsDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all collections with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Collections retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        collections: {
          type: 'array',
          items: { $ref: '#/components/schemas/CollectionsDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
      },
    },
  })
  @ApiQuery({ type: PaginationQueryCollectionDto })
  async findAll(
    @Query()
    query: PaginationQueryCollectionDto & { status?: string; slug?: string }
  ) {
    if (query.slug) {
      return this.collectionsService.findBySlug(query.slug);
    }
    if (query.status) {
      return this.collectionsService.findByStatus(query.status, query);
    }
    return this.collectionsService.findAll(query);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get collection by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Collection retrieved successfully',
    type: CollectionsDto,
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  async findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @Get(':id/products')
  @PublicRead()
  @ApiOperation({ summary: 'Get collection with products (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Collection with products retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  async findOneWithProducts(@Param('id') id: string) {
    return this.collectionsService.findOneWithProducts(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update collection by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Collection updated successfully',
    type: CollectionsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({ type: CollectionsDto })
  async update(
    @Param('id') id: string,
    @Body() updateCollectionDto: CollectionsDto
  ) {
    return this.collectionsService.update(id, updateCollectionDto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete collection by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Collection deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  async remove(@Param('id') id: string) {
    await this.collectionsService.remove(id);
    return { message: 'Collection deleted successfully' };
  }

  @Post(':id/products')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Add multiple products to collection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Products added to collection successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({ type: AddProductsToCollectionDto })
  async addProducts(
    @Param('id') id: string,
    @Body() addProductsDto: AddProductsToCollectionDto
  ) {
    await this.collectionsService.addProducts(id, addProductsDto.productIds);
    return { message: 'Products added to collection successfully' };
  }

  @Post(':id/products/:productId')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Add single product to collection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product added to collection successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async addSingleProduct(
    @Param('id') id: string,
    @Param('productId') productId: string
  ) {
    await this.collectionsService.addProducts(id, [productId]);
    return { message: 'Product added to collection successfully' };
  }

  @Delete(':id/products')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Remove multiple products from collection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Products removed from collection successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({ type: RemoveProductsFromCollectionDto })
  async removeProducts(
    @Param('id') id: string,
    @Body() removeProductsDto: RemoveProductsFromCollectionDto
  ) {
    await this.collectionsService.removeProducts(
      id,
      removeProductsDto.productIds
    );
    return { message: 'Products removed from collection successfully' };
  }

  @Delete(':id/products/:productId')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Remove single product from collection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from collection successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async removeSingleProduct(
    @Param('id') id: string,
    @Param('productId') productId: string
  ) {
    await this.collectionsService.removeProducts(id, [productId]);
    return { message: 'Product removed from collection successfully' };
  }

  @Patch(':id/products/order')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.COLLECTIONS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update product order in collection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product order updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({ type: UpdateProductOrderDto })
  async updateProductOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateProductOrderDto
  ) {
    await this.collectionsService.updateProductOrder(
      id,
      updateOrderDto.productId,
      updateOrderDto.sortOrder
    );
    return { message: 'Product order updated successfully' };
  }

  @Get(':id/products/list')
  @PublicRead()
  @ApiOperation({ summary: 'Get all collection products (without pagination) (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Collection products retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  async getCollectionProducts(@Param('id') id: string) {
    return this.collectionsService.getCollectionProducts(id);
  }

  @Get(':id/products/paginated')
  @PublicRead()
  @ApiOperation({
    summary: 'Get collection products with pagination and filtering (Public)',
  })
  @ApiResponse({
    status: 200,
    description: 'Collection products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              sortOrder: { type: 'number' },
              createdAt: { type: 'string' },
              product: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiQuery({ type: CollectionProductsPaginationDto })
  async getCollectionProductsPaginated(
    @Param('id') id: string,
    @Query() query: CollectionProductsPaginationDto
  ) {
    return this.collectionsService.getCollectionProductsPaginated(id, query);
  }
}
