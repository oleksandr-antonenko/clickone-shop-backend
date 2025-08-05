import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRoleDto {
  @ApiProperty({
    description: 'Role to add to the user',
    example: 'admin',
    enum: ['admin', 'manager', 'user', 'moderator']
  })
  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  role: string;
} 
 