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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateFamilyDto } from '../dto/create-family.dto';
import { PaginationQueryFamilyDto } from '../dto/pagination-query-family.dto';
import { UpdateFamilyDto } from '../dto/update-family.dto';
import { FamiliesService } from '../service/families.service';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product family' })
  @ApiResponse({
    status: 201,
    description: 'Product family created successfully',
    type: CreateFamilyDto,
  })
  @ApiBody({ type: CreateFamilyDto })
  async create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familiesService.create(createFamilyDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all product families' })
  @ApiResponse({
    status: 200,
    description: 'Product families fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'No products families found' })
  async findAll(@Query() query: PaginationQueryFamilyDto) {
    return this.familiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product family by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product family fetched successfully',
    type: CreateFamilyDto,
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async findOne(@Param('id') id: string) {
    return this.familiesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product family by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product family updated successfully',
    type: UpdateFamilyDto,
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyDto: UpdateFamilyDto
  ) {
    return this.familiesService.update(+id, updateFamilyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product family by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product family deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async remove(@Param('id') id: string) {
    return this.familiesService.remove(+id);
  }
}
