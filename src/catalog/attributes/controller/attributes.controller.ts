import { Body, Controller, Post } from '@nestjs/common';
import { AttributesService } from '../service/attributes.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAttributesTypeDto } from '../dto/create-attributes-type.dto';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attributes type' })
  @ApiResponse({
    status: 201,
    description: 'Attributes type created successfully',
  })
  @ApiBody({ type: CreateAttributesTypeDto })
  async create(@Body() createAttributesTypeDto: CreateAttributesTypeDto) {
    return this.attributesService.createType(createAttributesTypeDto);
  }
}
