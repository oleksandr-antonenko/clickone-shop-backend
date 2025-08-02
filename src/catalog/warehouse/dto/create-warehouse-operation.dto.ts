import { ApiProperty } from '@nestjs/swagger';

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { WarehouseChangeType } from '../interfaces/warehouse-operation.interface';

export class CreateWarehouseOperationDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    enum: WarehouseChangeType,
    description: 'Type of warehouse operation',
  })
  @IsEnum(WarehouseChangeType)
  type: WarehouseChangeType;

  @ApiProperty({ required: false, description: 'Quantity added by supplier' })
  @IsOptional()
  @IsInt()
  supplierAddition?: number;

  @ApiProperty({
    required: false,
    description: 'Quantity written off from inventory',
  })
  @IsOptional()
  @IsInt()
  inventoryWriteOff?: number;

  @ApiProperty({ required: false, description: 'Updated low stock threshold' })
  @IsOptional()
  @IsInt()
  lowStockThreshold?: number;

  @ApiProperty({
    required: false,
    description: 'Quantity before the operation',
  })
  @IsOptional()
  @IsInt()
  beforeQuantity?: number;

  @ApiProperty({ required: false, description: 'Quantity after the operation' })
  @IsOptional()
  @IsInt()
  afterQuantity?: number;

  @ApiProperty({ required: false, description: 'Cost price of the product' })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiProperty({
    required: false,
    description: 'Optional comment for the operation',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'User who performed the operation' })
  @IsString()
  @IsNotEmpty()
  performedBy: string;
}
