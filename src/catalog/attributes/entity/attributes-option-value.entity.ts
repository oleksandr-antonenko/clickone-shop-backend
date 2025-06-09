import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Product} from '../../product/entities/product.entity';
import {AttributeValue} from './attributes-value.entity';

@Entity('product_option_values')
export class ProductOptionValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  valueId: number;

  @ManyToOne(() => Product, (product) => product.options)
  @JoinColumn({name: 'product_id'})
  product: Product;

  @ManyToOne(() => AttributeValue, (value) => value.productOptionValues)
  @JoinColumn({name: 'value_id'})
  optionValue: AttributeValue;
}
