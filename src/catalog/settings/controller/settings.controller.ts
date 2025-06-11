import { Controller, Get, Param } from '@nestjs/common';
import { SettingsService } from '../service/settings.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

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
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async findOne(@Param('id') id: string) {
    return this.settingsService.findOne(+id);
  }
}
