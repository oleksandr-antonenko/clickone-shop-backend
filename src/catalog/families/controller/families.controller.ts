import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FamiliesService } from '../service/families.service';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateFamilyDto } from '../dto/update-family.dto';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product family' })
  @ApiResponse({
    status: 201,
    description: 'Product family created successfully',
  })
  @ApiBody({ type: CreateFamilyDto })
  async create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familiesService.create(createFamilyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product families' })
  @ApiResponse({
    status: 200,
    description: 'Product families fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'No products families found' })
  async findAll() {
    return this.familiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product family by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product family fetched successfully',
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
  })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
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
