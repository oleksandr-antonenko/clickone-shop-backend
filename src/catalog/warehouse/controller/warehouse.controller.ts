import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PaginationQueryBrandDto } from '~/catalog/brands/dto/pagination-query-brand';
import { PublicRead } from '~/common/decorators/public.decorator';

import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseService } from '../service/warehouse.service';

@Controller('warehouses')
@PublicRead()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // @Post()
  // create(@Body() createWarehouseDto: CreateWarehouseDto) {
  //   return this.warehouseService.create(createWarehouseDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all warehouse items' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse items fetched successfully',
  })
  findAll(@Query() query: PaginationQueryBrandDto) {
    return this.warehouseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a warehouse item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse item fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Warehouse item not found' })
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto
  ) {
    return this.warehouseService.update(id, updateWarehouseDto);
  }
}
