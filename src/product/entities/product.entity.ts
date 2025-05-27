import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductFamily } from "./product-family.entity";
// import { ProductOptionValue } from "./product-option-value.entity";
// import { ProductSetting } from "./product-setting.entity";

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  storage: number;

  @Column()
  chip: string;

  @ManyToOne(()=>ProductFamily, family => family.products)
  family: ProductFamily;
  
//   @OneToMany(()=>ProductOptionValue, option => option.product)
//   options: ProductOptionValue[];

//   @OneToMany(()=>ProductSetting, setting => setting.product)
//   settings: ProductSetting[];
}
