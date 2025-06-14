import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute ID', example: 1, required: true })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsNumber()
  valueId: number;

  @ApiProperty({ description: 'Product ID', example: 1, required: true })
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  productId: number;
}
