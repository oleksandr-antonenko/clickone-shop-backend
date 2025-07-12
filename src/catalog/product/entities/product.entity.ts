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
import { Attribute } from '~/catalog/attributes/entity/attribute.entity';
import { Brand } from '~/catalog/brands/entities/brand.entity';
import { Category } from '~/catalog/category/entities/category.entity';

import { ProductFamily } from '../../families/entity/product-family.entity';
import { ProductSetting } from '../../settings/entity/product-setting.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  stock: boolean;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  sku: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'draft', 'archived'],
    default: 'draft',
  })
  status: 'active' | 'draft' | 'archived';

  @Column({ type: 'varchar', nullable: true })
  familyId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  comparePrice?: number;

  @Column({ type: 'jsonb', nullable: true })
  translations?: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle?: string;

  @Column({ type: 'text', nullable: true })
  seoDescription?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions?: { length: number; width: number; height: number };

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => ProductFamily, (family) => family.products)
  family: ProductFamily;

  @OneToMany(() => Attribute, (attribute) => attribute.product)
  attributes: Attribute[];

  @OneToMany(() => ProductSetting, (setting) => setting.product)
  settings: ProductSetting[];

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;
}
