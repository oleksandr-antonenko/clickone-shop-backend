import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Collection } from './collections.entity';
import { Product } from '~/catalog/product/entities/product.entity';

@Entity('collection_products')
export class CollectionProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  collectionId: string;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Collection, (collection) => collection.collectionProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => Product, (product) => product.collectionProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
} 