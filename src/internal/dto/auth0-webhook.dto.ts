import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Auth0WebhookDto {
  @ApiProperty({
    description: 'Auth0 user ID (sub)',
    example: 'auth0|5f7c8ec7c33c6c004bbafe82'
  })
  @IsString()
  sub: string; 

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John'
  })
  @IsString()
  @IsOptional()
  given_name?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe'
  })
  @IsString()
  @IsOptional()
  family_name?: string;

  @ApiPropertyOptional({
    description: 'User profile picture URL',
    example: 'https://lh3.googleusercontent.com/a/example'
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiPropertyOptional({
    description: 'User nickname',
    example: 'johndoe'
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Auth0 app metadata',
    example: {}
  })
  @IsObject()
  @IsOptional()
  app_metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Auth0 user metadata',
    example: {}
  })
  @IsObject()
  @IsOptional()
  user_metadata?: Record<string, any>;
} 
 