import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Quantity',
    example: 1,
    required: true,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseInt(value as string) : undefined))
  quantity: number;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    required: true,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseInt(value as string) : undefined))
  reservedQuantity: number;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseInt(value as string) : undefined))
  availableQuantity: number;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseInt(value as string) : undefined))
  lowStockThreshold: number;

  @ApiProperty({
    description: 'Location name',
    example: '1',
    required: true,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Supplier name',
    example: 'Supplier',
    required: true,
  })
  @IsOptional()
  @IsString()
  supplier?: string;

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
    description: 'Cost price for discounts',
    example: 1199.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseFloat(value as string) : undefined))
  costPrice?: number;

  @ApiProperty({ description: 'Product ID', example: '1', required: true })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
