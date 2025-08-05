import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class AdminUpdateUserRolesDto {
  @ApiProperty({
    description: 'Array of roles to assign to the user',
    example: ['admin', 'manager'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roles: string[];
} 
 