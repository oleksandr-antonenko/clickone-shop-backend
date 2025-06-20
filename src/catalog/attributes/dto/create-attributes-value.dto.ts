import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAttributesValueDto {
  @IsString()
  @ApiProperty({
    description: 'Value of the attributes value',
    example: 'Attributes value 1',
    required: true,
  })
  @IsNotEmpty()
  value: string;

  @IsString()
  @ApiProperty({
    description: 'Hex code of the attributes value',
    example: 'code-1',
    required: true,
  })
  @IsNotEmpty()
  hexCode: string;

  @IsNumber()
  @ApiProperty({
    description: 'Attributes type ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? parseInt(value) : undefined
  )
  attributesTypeId?: number;
}
