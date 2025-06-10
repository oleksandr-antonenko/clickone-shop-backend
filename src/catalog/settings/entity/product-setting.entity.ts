import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('settings')
export class ProductSetting {
  @ApiProperty({ description: 'Unique identifier of the settings' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Product setting name',
    required: true,
  })
  @Column({ type: 'varchar', length: 255 })
  key: string;

  @ApiProperty({
    description: 'Product setting value',
    required: true,
  })
  @Column({ type: 'varchar', length: 255 })
  value: string;

  @ApiProperty({ description: 'Creation date', readOnly: true })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', readOnly: true })
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Product relationship',
    type: () => [Product],
    required: false,
  })
  @ManyToOne(() => Product, (product) => product.settings, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
