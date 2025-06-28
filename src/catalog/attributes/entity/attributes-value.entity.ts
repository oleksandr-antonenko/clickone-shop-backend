import { ApiProperty } from '@nestjs/swagger';

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ProductOptionValue } from './attributes-option-value.entity';

@Entity('attribute_values')
export class AttributeValue {
  @ApiProperty({ description: 'Unique identifier of the attributes value' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the attributes type', required: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Slug of the attributes type', required: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

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
    description: 'ProductOptionValue relationship',
    type: () => [ProductOptionValue],
    required: false,
  })
  @OneToMany(() => ProductOptionValue, (value) => value.optionValue)
  productOptionValues: ProductOptionValue[];
}
