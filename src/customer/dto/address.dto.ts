import { IsOptional, IsString, IsEnum } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  @IsEnum(['shipping', 'billing', 'both'])
  type?: 'shipping' | 'billing' | 'both';

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  address1: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
