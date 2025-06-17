import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Category } from '../../category/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('product_families')
export class ProductFamily {
  @ApiProperty({ description: 'Unique identifier of the product family' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the product family', required: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the product family',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Creation date', readOnly: true })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', readOnly: true })
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Category relationship',
    type: () => Category,
  })
  @ManyToOne(() => Category, (category) => category.families, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({
    description: 'Products relationship',
    type: () => [Product],
  })
  @OneToMany(() => Product, (product) => product.family)
  products: Product[];
}

