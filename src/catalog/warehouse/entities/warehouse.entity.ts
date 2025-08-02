import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';

import { WarehouseOperation } from './warehouse-operation.entity';

@Entity('warehouse')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'int', nullable: false })
  reservedQuantity: number;

  @Column({ type: 'int', nullable: false })
  availableQuantity: number;

  @Column({ type: 'int', nullable: false })
  lowStockThreshold: number;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'varchar', nullable: true })
  supplier?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice?: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(
    () => WarehouseOperation,
    (warehouseOperation) => warehouseOperation.warehouse
  )
  warehouseOperations: WarehouseOperation[];
}
