import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AttributeValue } from "./attributes-value.entity";

@Entity('attribute_types')
export class AttributeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(()=>AttributeValue, value => value.type)
  values: AttributeValue[];
}