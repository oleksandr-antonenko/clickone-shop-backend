import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  CollectionStatus,
  CollectionType,
} from '../interface/collections.interface';

export class CollectionsDto {
  @ApiProperty({
    description: 'Name of the collection',
    example: 'Summer Collection 2024',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the collection',
    example: 'summer-collection-2024',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Description of the collection',
    example: 'A curated collection of summer essentials for 2024',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of collection',
    enum: CollectionType,
    example: CollectionType.MANUAL,
    required: true,
  })
  @IsEnum(CollectionType)
  type: CollectionType;

  @ApiProperty({
    description: 'Status of the collection',
    enum: CollectionStatus,
    example: CollectionStatus.ACTIVE,
    required: true,
  })
  @IsEnum(CollectionStatus)
  status: CollectionStatus;

  @ApiProperty({
    description: 'Number of products in the collection',
    example: 25,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  productsCount: number;

  @ApiPropertyOptional({
    description: 'Start date for the collection (ISO 8601 format)',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the collection (ISO 8601 format)',
    example: '2024-08-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Array of conditions for automatic collections',
    example: ['category:electronics', 'price:gte:100'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional({
    description: 'Image URL for the collection',
    example: 'https://example.com/collection-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Creation timestamp (auto-generated)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Last update timestamp (auto-generated)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  updatedAt?: string;
}
