import {
    IsArray,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString()
    firstName?: string;
  
    @IsOptional()
    @IsString()
    lastName?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];
  
    @IsOptional()
    @IsString()
    avatar?: string;
  
    @IsOptional()
    @IsString()
    status?: 'active' | 'inactive';
  }
  