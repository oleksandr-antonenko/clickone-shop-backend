import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { ProductStatus } from '../interface/create.interface';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'iPhone 15 Pro',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 999.99,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value as string))
  price: number;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone model with advanced features',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'SKU - unique product identifier',
    example: 'IPHONE-15-PRO-256GB-BLUE',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Product availability in stock',
    example: true,
    required: true,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  stock: boolean;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    default: ProductStatus.DRAFT,
    required: true,
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty({
    description: 'Product family ID for grouping',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiProperty({
    description: 'Product image file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    description: 'Compare price for discounts',
    example: 1199.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseFloat(value as string) : undefined))
  comparePrice?: number;

  @ApiProperty({
    description: 'Product translations',
    example: {
      en: { name: 'iPhone 15 Pro', description: 'Latest iPhone model' },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  translations?: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;

  @ApiProperty({
    description: 'SEO title',
    example: 'iPhone 15 Pro - Best Price',
    required: false,
  })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({
    description: 'SEO description',
    example: 'Buy iPhone 15 Pro with best price guarantee',
    required: false,
  })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty({
    description: 'Product weight in grams',
    example: 221,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseFloat(value as string) : undefined))
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions',
    example: { length: 15.6, width: 7.8, height: 0.8 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  dimensions?: { length: number; width: number; height: number };

  @ApiProperty({ 
    description: 'Brand ID', 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    required: false 
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({
    description: 'IDs of attributes linked to the product',
    type: [String],
    required: false,
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : (value as string[])
  )
  attributes?: string[];

  @ApiProperty({ 
    type: [String], 
    description: 'Selected attribute option IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000']
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : (value as string[])
  )
  selectedOptions?: string[];
}
