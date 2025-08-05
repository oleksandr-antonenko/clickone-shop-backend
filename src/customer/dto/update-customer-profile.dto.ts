import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class UpdateCustomerProfileDto {
  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
    required: false
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+380501234567',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Customer date of birth',
    example: '1990-01-01',
    required: false
  })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Customer gender',
    enum: ['male', 'female', 'other'],
    required: false
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'Marketing consent',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiProperty({
    description: 'Preferred language',
    example: 'uk',
    required: false
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({
    description: 'Preferred currency',
    example: 'UAH',
    required: false
  })
  @IsOptional()
  @IsString()
  preferredCurrency?: string;

  @ApiProperty({
    description: 'Customer addresses',
    type: [AddressDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @Type(() => AddressDto)
  addresses?: AddressDto[];
} 
 