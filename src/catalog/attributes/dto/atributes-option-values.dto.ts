import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute ID', example: 1, required: true })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsNumber()
  valueId: string;
}
