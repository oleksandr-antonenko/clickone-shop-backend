import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the product setting',
    example: 'Color',
    required: true,
  })
  @IsNotEmpty()
  key: string;

  @IsString()
  @ApiProperty({
    description: 'Value of the product setting',
    example: 'Black',
    required: true,
  })
  @IsNotEmpty()
  value: string;

  @IsString()
  @ApiProperty({ description: 'Product ID', example: 1, required: true })
  @IsNotEmpty()
  productId: string;
}
