import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute ID', example: 1, required: true })
  @IsString()
  valueId: string;
}
