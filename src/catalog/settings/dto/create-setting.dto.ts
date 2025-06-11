import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the product setting',
    example: 'Color',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Value of the product setting',
    example: 'Black',
    required: true,
  })
  @IsNotEmpty()
  value: string;

  @IsNumber()
  @ApiProperty({ description: 'Product ID', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value) : undefined,
  )
  productId?: number;
}
