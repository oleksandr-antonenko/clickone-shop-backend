import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PaginationQueryBrandDto } from '~/catalog/brands/dto/pagination-query-brand';
import { PublicRead } from '~/common/decorators/public.decorator';

import { CreateWarehouseOperationDto } from '../dto/create-warehouse-operation.dto';
import { WarehouseService } from '../service/warehouse.service';

@Controller('warehouses')
@PublicRead()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post(':id/operations')
  @ApiOperation({ summary: 'Create a new warehouse operation' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse operation created successfully',
    type: CreateWarehouseOperationDto,
  })
  @ApiBody({ type: CreateWarehouseOperationDto })
  create(
    @Param('id') id: string,
    @Body() createWarehouseOperationDto: CreateWarehouseOperationDto
  ) {
    return this.warehouseService.createOperation(
      id,
      createWarehouseOperationDto
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get all warehouse operations' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse operations fetched successfully',
  })
  findAllOperations(
    @Param('id') id: string,
    @Query() query: PaginationQueryBrandDto
  ) {
    return this.warehouseService.findAllOperations(id, query);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouse items' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse items fetched successfully',
  })
  findAll(@Query() query: PaginationQueryBrandDto) {
    return this.warehouseService.findAll(query);
  }
}
