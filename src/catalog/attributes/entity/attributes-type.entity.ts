import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttributeValue } from './attributes-value.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('attribute_types')
export class AttributeType {
  @ApiProperty({ description: 'Unique identifier of the attributes type' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the attributes type', required: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Slug of the attributes type', required: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @ApiProperty({
    description: 'AttributeValue relationship',
    type: () => [AttributeValue],
  })
  @OneToMany(() => AttributeValue, (value) => value.type)
  values: AttributeValue[];
}
