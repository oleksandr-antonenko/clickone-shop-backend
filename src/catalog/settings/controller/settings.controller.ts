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
import { CreateSettingDto } from '../dto/create-setting.dto';
import { PaginationQuerySettingsDto } from '../dto/pagination-query-settings.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { SettingsService } from '../service/settings.service';

@ApiTags('Product Settings')
@Controller('settings')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.SETTINGS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Create a new product setting (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product setting created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CreateSettingDto })
  async create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @PublicRead()
  @ApiOperation({ summary: 'Get all product settings (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Product settings fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'No products settings found' })
  async findAll(@Query() query: PaginationQuerySettingsDto) {
    return this.settingsService.findAll(query);
  }

  @Get(':id')
  @PublicRead()
  @ApiOperation({ summary: 'Get a product setting by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Product setting fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Product setting not found' })
  async findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.SETTINGS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Update a product setting by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product setting updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product setting not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @CheckPermission(ResourceType.SETTINGS, PermissionAction.DELETE)
  @ApiOperation({ summary: 'Delete a product setting by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product setting deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product setting not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
