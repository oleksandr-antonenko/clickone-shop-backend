import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateAttributeDto } from '~/catalog/attributes/dto/attributes-option-values.dto';
import { AttributesService } from '~/catalog/attributes/service/attributes.service';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}
  @Get(':id')
  @ApiOperation({ summary: 'Get attributes value by id' })
  @ApiResponse({
    status: 200,
    description: 'Product fetched by ID successfully',
  })
  @ApiResponse({ status: 404, description: 'No products found' })
  findOne(
    @Param('id') id: string,
    @Query('product_id') currentProductId: string
  ) {
    return this.attributesService.findOne(id, currentProductId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes value' })
  @ApiResponse({ status: 200, description: 'Products fetched successfully' })
  @ApiResponse({ status: 404, description: 'No products found' })
  findAll(@Query('product_id') currentProductId: string) {
    return this.attributesService.findAll(currentProductId);
  }

  @Post()
  @ApiOperation({ summary: 'Create attribute value' })
  @ApiResponse({ status: 200, description: 'Attribute created successfully' })
  @ApiResponse({ status: 404, description: 'No attribute found' })
  create(
    @Query('product_id') currentProductId: string,
    @Body() creatingAttribute: CreateAttributeDto
  ) {
    return this.attributesService.create(creatingAttribute, currentProductId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attribute value' })
  @ApiResponse({ status: 200, description: 'Attribute updated successfully' })
  @ApiResponse({ status: 404, description: 'No attribute found' })
  update(
    @Body() updatingAttribute: CreateAttributeDto,
    @Query('product_id') currentProductId: string,
    @Param('id') id: string
  ) {
    return this.attributesService.update(
      id,
      updatingAttribute,
      currentProductId
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attribute value by ID' })
  @ApiResponse({ status: 200, description: 'Attribute deleted successfully' })
  @ApiResponse({ status: 404, description: 'No attribute found' })
  delete(
    @Param('id') id: string,
    @Query('product_id') currentProductId: string
  ) {
    return this.attributesService.delete(id, currentProductId);
  }
}
