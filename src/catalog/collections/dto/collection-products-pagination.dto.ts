import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CollectionProductsPaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'sortOrder',
    description: 'Field to sort by',
    enum: [
      'sortOrder',
      'createdAt',
      'product.name',
      'product.price',
      'product.createdAt',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'sortOrder',
    'createdAt',
    'product.name',
    'product.price',
    'product.createdAt',
  ])
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: '{"product.name":{"like":"iPhone"},"product.price":{"gte":100}}',
    description:
      'Filters object as JSON string (supports nested product fields)',
  })
  @IsOptional()
  @IsString()
  filters?: string;
}
