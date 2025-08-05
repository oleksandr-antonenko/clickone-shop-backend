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

import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { PaginationQueryAttributesDto } from '../dto/pagination-query-attributes.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import { AttributesService } from '../service/attributes.service';

@ApiTags('Attributes')
@Controller('attributes')
@ApiBearerAuth()
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.ATTRIBUTES, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new attribute (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Attribute created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CreateAttributeDto })
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all attributes (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of attributes found',
  })
  async findAll(@Query() query: PaginationQueryAttributesDto) {
    return this.attributesService.findAll(query);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get attributes by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Attribute found',
  })
  async findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.ATTRIBUTES, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update attribute by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Attribute updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto
  ) {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.ATTRIBUTES, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete attribute by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Attribute deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async remove(@Param('id') id: string) {
    return this.attributesService.delete(id);
  }
}
