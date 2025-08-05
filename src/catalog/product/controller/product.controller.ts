import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PublicRead } from '../../../common/decorators/public.decorator';
import { PermissionGuard } from '../../../admin/guards/permission.guard';
import { CheckPermission } from '../../../admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '../../../admin/entities/permission.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../service/product.service';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.PRODUCTS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CreateProductDto })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productService.createProducts(createProductDto, file);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all products (Public)' })
  @ApiResponse({ status: 200, description: 'Products fetched successfully' })
  @ApiResponse({ status: 404, description: 'No products found' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get a product by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Product fetched successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.PRODUCTS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update a product by ID (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productService.updateProduct(id, updateProductDto, file);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.PRODUCTS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete a product by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
