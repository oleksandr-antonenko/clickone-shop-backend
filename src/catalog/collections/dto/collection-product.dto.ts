import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddProductsToCollectionDto {
  @ApiProperty({
    description: 'Array of product IDs to add to the collection',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  productIds: number[];
}

export class RemoveProductsFromCollectionDto {
  @ApiProperty({
    description: 'Array of product IDs to remove from the collection',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  productIds: number[];
}

export class UpdateProductOrderDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'New sort order for the product',
    example: 1,
  })
  @IsNumber()
  sortOrder: number;
}

export class CollectionProductResponseDto {
  @ApiProperty({
    description: 'Collection product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Collection ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  collectionId: string;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'Sort order in collection',
    example: 1,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Product details',
  })
  product?: any;
} 