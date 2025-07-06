import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({
    description: 'Name of the product family',
    example: 'Product Family 1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the product family',
    example: 'Description of the product family 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value) : undefined
  )
  categoryId?: number;
}
