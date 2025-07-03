import { IsNumberString, IsOptional } from 'class-validator';

export class FilterQueryDto {
  @IsOptional()
  filters?: Record<string, Record<string, any>>;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
