import {IsOptional, IsNumberString} from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
