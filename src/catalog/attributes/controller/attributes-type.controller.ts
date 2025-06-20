import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { AttributesTypeService } from '../service/attributes-type.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAttributesTypeDto } from '../dto/create-attributes-type.dto';

@Controller('attributes/types')
export class AttributesTypeController {
  constructor(private readonly attributesService: AttributesTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attributes type' })
  @ApiResponse({
    status: 201,
    description: 'Attributes type created successfully',
  })
  @ApiBody({ type: CreateAttributesTypeDto })
  async create(@Body() createAttributesTypeDto: CreateAttributesTypeDto) {
    return this.attributesService.create(createAttributesTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes types' })
  @ApiResponse({
    status: 200,
    description: 'List of attributes types',
  })
  async findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attributes type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attributes type found',
  })
  async findOne(@Body('id') id: number) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attributes type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attributes type updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAttributesTypeDto: CreateAttributesTypeDto
  ) {
    return this.attributesService.updateType(+id, updateAttributesTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attributes type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attributes type deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.attributesService.remove(+id);
  }
}
