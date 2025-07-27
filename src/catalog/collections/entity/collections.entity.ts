import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  CollectionStatus,
  CollectionType,
} from '../interface/collections.interface';
import { CollectionProduct } from './collection-product.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CollectionType,
    default: CollectionType.MANUAL,
  })
  type: CollectionType;

  @Column({
    type: 'enum',
    enum: CollectionStatus,
    default: CollectionStatus.ACTIVE,
  })
  status: CollectionStatus;

  @Column({ type: 'int', default: 0 })
  productsCount: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  conditions?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(
    () => CollectionProduct,
    (collectionProduct) => collectionProduct.collection
  )
  collectionProducts: CollectionProduct[];
}
