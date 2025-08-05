import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
  } from 'class-validator';
import { AddressDto } from './address.dto';
  
  export class CreateCustomerDto {
    @IsEmail()
    email: string;
  
    @IsString()
    firstName: string;
  
    @IsString()
    lastName: string;
  
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
  
    @IsOptional()
    addresses?: AddressDto[];
  }
  