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

import { PublicRead } from '../../../common/decorators/public.decorator';
import { PermissionGuard } from '~/admin/guards/permission.guard';
import { CheckPermission } from '~/admin/decorators/check-permission.decorator';
import { ResourceType, PermissionAction } from '~/admin/entities/permission.entity';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { PaginationQueryFamilyDto } from '../dto/pagination-query-family.dto';
import { UpdateFamilyDto } from '../dto/update-family.dto';
import { FamiliesService } from '../service/families.service';

@ApiTags('Product Families')
@Controller('families')
@ApiBearerAuth()
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.FAMILIES, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new product family (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product family created successfully',
    type: CreateFamilyDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CreateFamilyDto })
  async create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familiesService.create(createFamilyDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all product families (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Product families fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'No products families found' })
  async findAll(@Query() query: PaginationQueryFamilyDto) {
    return this.familiesService.findAll(query);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get a product family by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Product family fetched successfully',
    type: CreateFamilyDto,
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.FAMILIES, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update a product family by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product family updated successfully',
    type: UpdateFamilyDto,
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyDto: UpdateFamilyDto
  ) {
    return this.familiesService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.FAMILIES, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete a product family by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product family deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async remove(@Param('id') id: string) {
    return this.familiesService.remove(id);
  }
}
