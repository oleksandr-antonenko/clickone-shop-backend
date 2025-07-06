import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1
    })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({
        description: 'Limit number',
        example: 10
    })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ example: 'updatedAt', description: 'Field to sort by' })
    @IsOptional()
    @IsString()
    sortBy?: string;
  
    @ApiPropertyOptional({ 
      example: 'desc', 
      description: 'Sort order',
      enum: ['asc', 'desc', 'ASC', 'DESC']
    })
    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc', 'ASC', 'DESC'])
    sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  
    @ApiPropertyOptional({
      example: '{"name":{"like":"iPhone"},"price":{"gte":100}}',
      description: 'Filters object as JSON string'
    })
    @IsOptional()
    @IsString()
    filters?: string;
    
}