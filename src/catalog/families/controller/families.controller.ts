import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateProductFamilyDto } from '../dto/product-family.dto';
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
  })
  @ApiBody({ type: CreateProductFamilyDto })
  async create(@Body() createProductFamilyDto: CreateProductFamilyDto) {
    return this.familiesService.create(createProductFamilyDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all product families' })
  @ApiResponse({
    status: 200,
    description: 'Product families retrieved successfully',
  })
  async findAll() {
    return this.familiesService.findAll();
  }
}
