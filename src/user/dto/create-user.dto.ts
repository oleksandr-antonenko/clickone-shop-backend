import {
    IsArray,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class CreateUserDto {
    @IsEmail()
    email: string;
  
    @IsString()
    firstName: string;
  
    @IsString()
    lastName: string;
  
    @IsArray()
    @IsString({ each: true })
    roles: string[];
  
    @IsOptional()
    @IsString()
    avatar?: string;
  
    @IsOptional()
    permissions?: {
      resource: string;
      actions: ('create' | 'read' | 'update' | 'delete')[];
    }[];
  }
  