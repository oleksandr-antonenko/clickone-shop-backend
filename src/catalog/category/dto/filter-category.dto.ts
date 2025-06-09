import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsNumber, IsOptional} from 'class-validator';
import {Transform} from 'class-transformer';

export class FilterCategoryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({value}: {value: string}) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiProperty({description: 'Is active', example: true, required: false})
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({value}: {value: string}) =>
    value ? parseInt(value) : undefined
  )
  @ApiProperty({description: 'Parent ID', example: 1, required: false})
  parentId?: number;
}
