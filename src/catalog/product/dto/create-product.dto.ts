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
  name: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 999.99,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone model with advanced features',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'SKU - unique product identifier',
    example: 'IPHONE-15-PRO-256GB-BLUE',
    required: true,
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
    required: true,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  categoryId: number;

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
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  familyId?: number;

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
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
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
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions',
    example: { length: 15.6, width: 7.8, height: 0.8 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  dimensions?: { length: number; width: number; height: number };

  @ApiProperty({ description: 'Brand ID', example: 1, required: false })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value) : undefined
  )
  brandId: number;

  @ApiProperty({
    description: 'IDs of attributes linked to the product',
    type: [Number],
    required: false,
    example: [1, 3, 7],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map(Number) : value
  )
  attributes?: number[];

  @ApiProperty({ type: [Number], description: 'Selected attribute option IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map(Number) : value
  )
  @IsOptional()
  selectedOptions?: number[];
}
