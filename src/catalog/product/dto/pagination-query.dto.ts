import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
