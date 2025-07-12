import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';


export class PaginationQueryCollectionDto {
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
    example: 'updatedAt',
    description: 'Field to sort by',
    enum: ['id', 'name', 'slug', 'type', 'status', 'productsCount', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'name', 'slug', 'type', 'status', 'productsCount', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: '{"name":{"like":"Summer"},"status":{"eq":"active"}}',
    description: 'Filters object as JSON string',
  })
  @IsOptional()
  @IsString()
  filters?: string;
} 