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
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { PublicRead } from '~/common/decorators/public.decorator';
import { PermissionGuard } from '~/admin/guards/permission.guard';
import { CheckPermission } from '~/admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '~/admin/entities/permission.entity';

import { CreateBrandDto } from '../dto/create-brand.dto';
import { PaginationQueryBrandDto } from '../dto/pagination-query-brand';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { BrandService } from '../service/brand.service';

@ApiTags('Brands')
@Controller('brands')
@ApiBearerAuth()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.BRANDS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new brand (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CreateBrandDto })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all brands (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Brands fetched successfully',
  })
  findAll(@Query() query: PaginationQueryBrandDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get a brand by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Brand fetched successfully',
  })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.BRANDS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update a brand by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.BRANDS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete a brand by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
