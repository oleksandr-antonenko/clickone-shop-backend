import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Unique identifier of the attributes value' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Value of the attributes value', required: true })
  @Column({ type: 'varchar', length: 255 })
  value: string;

  @ApiProperty({
    description: 'Hex code of the attributes value',
    required: true,
  })
  @Column({ type: 'varchar', length: 255 })
  hex_code: string;

  @ApiProperty({
    description: 'AttributeType relationship',
    type: () => [AttributeType],
    required: true,
  })
  @ManyToOne(() => AttributeType, (type) => type.values)
  @JoinColumn({ name: 'type_id' })
  type: AttributeType;

  @ApiProperty({
    description: 'ProductOptionValue relationship',
    type: () => [ProductOptionValue],
    required: true,
  })
  @OneToMany(() => ProductOptionValue, (value) => value.optionValue)
  productOptionValues: ProductOptionValue[];
}
