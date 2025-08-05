import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class UpdateCustomerDto {
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
    @IsString()
    phone?: string;
  
    @IsOptional()
    @IsString()
    dateOfBirth?: string;
  
    @IsOptional()
    @IsEnum(['male', 'female', 'other'])
    gender?: 'male' | 'female' | 'other';
  
    @IsOptional()
    @IsBoolean()
    marketingConsent?: boolean;
  
    @IsOptional()
    @IsString()
    preferredLanguage?: string;
  
    @IsOptional()
    @IsString()
    preferredCurrency?: string;
  
    @IsOptional()
    @IsArray()
    tags?: string[];
  }
  