import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';

import { Attribute } from './attribute.entity';

@Entity('attribute_options')
export class AttributeOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  value: string;

  @ManyToOne(() => Attribute, (attribute) => attribute.options, {
    onDelete: 'CASCADE',
  })
  attribute: Attribute;

  @ManyToMany(() => Product, (product) => product.selectedOptions)
  products: Product[];
}
