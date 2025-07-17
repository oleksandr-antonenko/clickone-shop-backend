import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';

import { AttributeOption } from './attribute-options.entity';

@Entity('attribute')
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'boolean' })
  required: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => AttributeOption, (option) => option.attribute, {
    cascade: true,
  })
  options: AttributeOption[];

  @ManyToMany(() => Product, (product) => product.attributes)
  products: Product[];
}
