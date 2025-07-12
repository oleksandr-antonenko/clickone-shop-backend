import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
    description: 'Key of the attribute',
    example: 'attributes key 1',
    required: true,
  })
  @IsNotEmpty()
  key: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @IsString()
  @ApiProperty({
    description: 'Hex code of the attribute',
    example: 'code-1',
    required: true,
  })
  @IsOptional()
  description?: string;
}
