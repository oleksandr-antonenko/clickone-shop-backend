import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
    description: 'Customer status',
    enum: ['active', 'inactive', 'blocked'],
    required: false
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'blocked'])
  status?: 'active' | 'inactive' | 'blocked';

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({
    description: 'Whether phone is verified',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;

  @ApiProperty({
    description: 'Customer segment',
    enum: ['vip', 'regular', 'new', 'inactive'],
    required: false
  })
  @IsOptional()
  @IsEnum(['vip', 'regular', 'new', 'inactive'])
  segment?: 'vip' | 'regular' | 'new' | 'inactive';

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
    description: 'Customer tags',
    example: ['vip', 'loyal'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
} 
 