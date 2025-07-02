import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AttributesValueService } from '../service/attributes-value.service';
import { CreateAttributesValueDto } from '../dto/create-attributes-value.dto';

@Controller('attributes/values')
export class AttributesValueController {
  constructor(private readonly attributesService: AttributesValueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attributes value' })
  @ApiResponse({
    status: 201,
    description: 'Attributes value created successfully',
  })
  @ApiBody({ type: CreateAttributesValueDto })
  async create(@Body() createAttributesValueDto: CreateAttributesValueDto) {
    return this.attributesService.create(createAttributesValueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes values' })
  @ApiResponse({
    status: 200,
    description: 'List of attributes values',
  })
  async findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attributes value by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attributes value found',
  })
  async findOne(@Body('id') id: number) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attributes value by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attributes value updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAttributesTypeDto: CreateAttributesValueDto
  ) {
    return this.attributesService.update(+id, updateAttributesTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attributes type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attributes type deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.attributesService.delete(+id);
  }
}
