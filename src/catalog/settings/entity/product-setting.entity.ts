import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('product_settings')
export class ProductSetting {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => Product, (product) => product.settings)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
