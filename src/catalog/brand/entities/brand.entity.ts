import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BrandStatus } from '../interface/createBrand.interface';

@Entity('brand')
export class Brand {
  @ApiProperty({ description: 'Unique identifier of the brand' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the brand', required: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Slug of the brand', required: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @ApiProperty({ description: 'Description of the brand', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Country of the brand', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string;

  @ApiProperty({ description: 'Logo of the brand', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string;

  @ApiProperty({ description: 'Website of the brand', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @ApiProperty({ description: 'Status of the brand', required: true })
  @Column({ type: 'enum', enum: BrandStatus, default: BrandStatus.ACTIVE })
  status: BrandStatus;

  @ApiProperty({
    description: 'Number of products for the brand',
    required: true,
  })
  @Column({ type: 'int', default: 0 })
  productsCount: number;

  @ApiProperty({ description: 'Creation date', readOnly: true })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', readOnly: true })
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
