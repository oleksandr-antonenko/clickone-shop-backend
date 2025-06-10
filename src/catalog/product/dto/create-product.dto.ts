import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ description: 'In stock', example: true })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  stock: boolean;

  @ApiProperty({
    description: 'Description',
    example: 'Latest iPhone model with advanced features',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Family ID', example: 1, required: false })
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
}
