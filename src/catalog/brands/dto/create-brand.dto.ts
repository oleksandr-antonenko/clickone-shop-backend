import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { BrandStatus } from '../interface/createBrand.interface';

export class CreateBrandDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the brand',
    example: "Victoria's Secret",
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Slug of the brand',
    example: 'victorias-secret',
    required: true,
  })
  @IsNotEmpty()
  slug: string;

  @IsString()
  @ApiProperty({
    description: 'Description of the brand',
    example: 'Американский бренд женского белья премиум-класса',
    required: false,
  })
  @IsOptional()
  description: string;

  @IsString()
  @ApiProperty({
    description: 'Country of the brand',
    example: 'США',
    required: false,
  })
  @IsOptional()
  country: string;

  @IsString()
  @ApiProperty({
    description: 'Logo of the brand',
    example: 'https://victoriassecret.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo: string;

  @IsString()
  @ApiProperty({
    description: 'Website of the brand',
    example: 'https://victoriassecret.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website: string;

  @IsString()
  @ApiProperty({
    description: 'Status of the brand',
    example: BrandStatus.ACTIVE,
    enum: BrandStatus,
    required: true,
  })
  @IsNotEmpty()
  status: BrandStatus;

  @IsNumber()
  @ApiProperty({
    description: 'Count of the brands',
    example: 3,
    required: true,
  })
  @IsNotEmpty()
  productsCount: number;
}
