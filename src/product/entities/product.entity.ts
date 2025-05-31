import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductFamily } from "./product-family.entity";
// import { ProductOptionValue } from "./product-option-value.entity";
// import { ProductSetting } from "./product-setting.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Unique identifier of the product' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the product',required:true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Price of the product',required:true })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Whether the product is in stock' })
  @Column({ type: 'boolean', default: true })
  stock: boolean;

  @ApiProperty({ description: 'Detailed description of the product',required:true })
  @Column({ type: 'text' })
  description: string;

  // @Column()
  // chip: string;

  @ApiProperty({ description: 'Base64 encoded image', required: false })
  @Column({ type: 'text', nullable: true })
  image?: string;

  @ApiProperty({ description: 'Product family relationship', type: () => ProductFamily })
  @ManyToOne(() => ProductFamily, family => family.products)
  family: ProductFamily;
  
//   @OneToMany(()=>ProductOptionValue, option => option.product)
//   options: ProductOptionValue[];

//   @OneToMany(()=>ProductSetting, setting => setting.product)
//   settings: ProductSetting[];
}
