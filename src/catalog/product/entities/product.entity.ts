import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {ProductFamily} from '../../families/entity/product-family.entity';
// import { ProductOptionValue } from "./product-option-value.entity";
// import { ProductSetting } from "./product-setting.entity";
import {ApiProperty} from '@nestjs/swagger';
import {ProductSetting} from '../../settings/entity/product-setting.entity';
import {ProductOptionValue} from '../../attributes/entity/attributes-option-value.entity';

@Entity('products')
export class Product {
  @ApiProperty({description: 'Unique identifier of the product'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({description: 'Name of the product', required: true})
  @Column({type: 'varchar', length: 255})
  name: string;

  @ApiProperty({description: 'Price of the product', required: true})
  @Column({type: 'decimal', precision: 10, scale: 2})
  price: number;

  @ApiProperty({description: 'Whether the product is in stock'})
  @Column({type: 'boolean', default: true})
  stock: boolean;

  @ApiProperty({
    description: 'Detailed description of the product',
    required: true,
  })
  @Column({type: 'text'})
  description: string;

  // @Column()
  // chip: string;

  @ApiProperty({description: 'Base64 encoded image', required: false})
  @Column({type: 'text', nullable: true})
  image?: string;

  @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;

  @ApiProperty({
    description: 'Product family relationship',
    type: () => ProductFamily,
  })
  @ManyToOne(() => ProductFamily, (family) => family.products)
  family: ProductFamily;

  @OneToMany(() => ProductOptionValue, (option) => option.product)
  options: ProductOptionValue[];

  @OneToMany(() => ProductSetting, (setting) => setting.product)
  settings: ProductSetting[];
}
