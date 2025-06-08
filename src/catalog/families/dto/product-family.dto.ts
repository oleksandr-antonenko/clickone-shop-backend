import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductFamilyDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the product family',
    example: 'Product Family 1',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Description of the product family',
    example: 'Description of product family 1',
    required: false,
  })
  @IsOptional()
  description: string;

  @IsNumber()
  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value) : undefined,
  )
  categoryId?: number;
}
