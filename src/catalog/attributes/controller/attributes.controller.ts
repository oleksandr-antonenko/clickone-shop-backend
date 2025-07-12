import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { AttributesService } from '../service/attributes.service';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({
    status: 201,
    description: 'Attribute created successfully',
  })
  @ApiBody({ type: CreateAttributeDto })
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  @ApiResponse({
    status: 200,
    description: 'List of attributes found',
  })
  async findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attributes by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attribute found',
  })
  async findOne(@Body('id') id: number) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attribute by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attribute updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAttributeDto: CreateAttributeDto
  ) {
    return this.attributesService.update(+id, updateAttributeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attribute by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attribute deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.attributesService.delete(+id);
  }
}
