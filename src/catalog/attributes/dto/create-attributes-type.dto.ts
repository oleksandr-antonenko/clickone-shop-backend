import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the attributes type',
    example: 'Attributes type 1',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Slug of the attributes type',
    example: 'attributes-type-1',
    required: true,
  })
  @IsNotEmpty()
  slug: string;
}
