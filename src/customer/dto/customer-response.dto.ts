import { Expose, Exclude, Type } from 'class-transformer';
import { AddressDto } from './address.dto';

@Exclude()
export class CustomerResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() phone?: string;
  @Expose() dateOfBirth?: string;
  @Expose() gender?: 'male' | 'female' | 'other';
  @Expose() status: 'active' | 'inactive' | 'blocked';
  @Expose() emailVerified: boolean;
  @Expose() phoneVerified: boolean;
  @Expose() totalOrders: number;
  @Expose() totalSpent: number;
  @Expose() averageOrderValue: number;
  @Expose() lastOrderDate?: Date;
  @Expose() tags: string[];
  @Expose() segment?: 'vip' | 'regular' | 'new' | 'inactive';
  @Expose() marketingConsent: boolean;
  @Expose() preferredLanguage: string;
  @Expose() preferredCurrency: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => AddressDto)
  addresses: AddressDto[];
}
