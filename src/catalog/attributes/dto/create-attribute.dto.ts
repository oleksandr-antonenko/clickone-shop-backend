import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the attribute',
    example: 'Attributes type 1',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Slug of the attribute',
    example: 'attributes-type-1',
    required: true,
  })
  @IsNotEmpty()
  slug: string;

  @IsString()
  @ApiProperty({
    description: 'Value of the attribute',
    example: 'Attributes value 1',
    required: true,
  })
  @IsNotEmpty()
  value: string;

  @IsString()
  @ApiProperty({
    description: 'Hex code of the attribute',
    example: 'code-1',
    required: true,
  })
  @IsNotEmpty()
  hexCode: string;

  @IsNumber()
  @ApiProperty({
    description: 'Product ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value) : undefined
  )
  productId: number;
}
