import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SettingsService } from '../service/settings.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSettingDto } from '../dto/create-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product setting' })
  @ApiResponse({
    status: 201,
    description: 'Product setting created successfully',
  })
  @ApiBody({ type: CreateSettingDto })
  async create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product settings' })
  @ApiResponse({
    status: 200,
    description: 'Product settings fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'No products settings found' })
  async findAll() {
    return this.settingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product setting by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product setting fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Product setting not found' })
  async findOne(@Param('id') id: string) {
    return this.settingsService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product setting by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product setting deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product setting not found' })
  async remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }
}
