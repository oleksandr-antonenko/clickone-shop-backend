import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductOptionValue } from './attributes-option-value.entity';
import { AttributeType } from './attributes-type.entity';

@Entity('attribute_values')
export class AttributeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column()
  hex_code: string;

  @ManyToOne(() => AttributeType, (type) => type.values)
  @JoinColumn({ name: 'type_id' })
  type: AttributeType;

  @OneToMany(() => ProductOptionValue, (value) => value.optionValue)
  productOptionValues: ProductOptionValue[];
}
