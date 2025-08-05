import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CompleteOrderDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Tracking number for the order',
    example: 'TRK123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiProperty({
    description: 'Delivery date',
    example: '2024-01-15T10:30:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @ApiProperty({
    description: 'Admin notes about order completion',
    example: 'Order delivered successfully to customer',
    required: false
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
} 
 