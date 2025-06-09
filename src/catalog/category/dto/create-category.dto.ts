import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';
import {CreateDateColumn, UpdateDateColumn} from 'typeorm';

export class CreateCategoryDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the category',
    example: 'Category 1',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Slug of the category',
    example: 'category-1',
    required: true,
  })
  slug: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description of the category',
    example: 'Description of category 1',
    required: false,
  })
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Image of the category',
    example: 'image.jpg',
    required: false,
  })
  image: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Parent ID of the category',
    example: '1',
    required: false,
  })
  parentId: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({description: 'Is active', example: true, required: false})
  isActive: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({description: 'Sort order', example: 1, required: false})
  sortOrder: number;

  @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;
}
