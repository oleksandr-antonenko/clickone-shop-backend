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

import { CreateBrandDto } from '../dto/create-brand.dto';
import { PaginationQueryBrandDto } from '../dto/pagination-query-brand';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { BrandService } from '../service/brand.service';
import { PublicRead } from '~/common/decorators/public.decorator';

@Controller('brands')
@PublicRead()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
  })
  @ApiBody({ type: CreateBrandDto })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({
    status: 200,
    description: 'Brands fetched successfully',
  })
  findAll(@Query() query: PaginationQueryBrandDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand fetched successfully',
  })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
  })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(+id, updateBrandDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}
