import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'Array of roles to assign to the user',
    example: ['admin', 'user'],
    type: [String],
    isArray: true,
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'User must have at least one role' })
  @IsString({ each: true })
  roles: string[];
} 
 