import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
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
    enum: ['id', 'name', 'price', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'name', 'price', 'createdAt', 'updatedAt'])
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
    example: '{"name":{"like":"iPhone"},"price":{"gte":100,"lte":1000}}',
    description: 'Filters object as JSON string',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;

    try {
      if (typeof value === 'object' && value !== null) {
        return value;
      }

      if (typeof value === 'string') {
        let decodedValue = value;

        try {
          decodedValue = decodeURIComponent(value);
        } catch (e) {
          return undefined;
        }

        return JSON.parse(decodedValue);
      }

      return value;
    } catch (error) {
      return undefined;
    }
  })
  filters?: Record<string, Record<string, any>>;
}
