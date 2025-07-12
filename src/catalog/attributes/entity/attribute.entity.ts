import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';

@Entity('attribute')
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'varchar', length: 255 })
  hexCode: string;

  @ManyToOne(() => Product, (product) => product.attributes)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
