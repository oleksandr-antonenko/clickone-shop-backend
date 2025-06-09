import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {ProductFamily} from '../../families/entity/product-family.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({unique: true})
  slug: string;

  @Column({nullable: true})
  description: string;

  @Column({nullable: true})
  image: string;

  @Column({nullable: true})
  parentId: number;

  @Column({nullable: true})
  isActive: boolean;

  @Column({default: 0})
  sortOrder: number;

  @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;

  @OneToMany(() => ProductFamily, (family) => family.category)
  families: ProductFamily[];
}
