import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WarehouseChangeType } from '../interfaces/warehouse-operation.interface';
import { Warehouse } from './warehouse.entity';

@Entity('warehouse_operation')
export class WarehouseOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WarehouseChangeType,
  })
  type: WarehouseChangeType;

  @Column({ type: 'int', nullable: true })
  supplierAddition?: number;

  @Column({ type: 'int', nullable: true })
  inventoryWriteOff?: number;

  @Column({ type: 'int', nullable: true })
  lowStockThreshold?: number;

  @Column({ type: 'int', nullable: true })
  beforeQuantity?: number;

  @Column({ type: 'int', nullable: true })
  afterQuantity?: number;

  @Column({ type: 'float', nullable: true })
  costPrice?: number;

  @Column({ type: 'varchar', nullable: true })
  comment?: string;

  @Column()
  performedBy: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Warehouse, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;
}
