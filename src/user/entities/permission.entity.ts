import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { UserEntity } from './user.entity';
  
  @Entity('permissions')
  export class PermissionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    resource: string;
  
    @Column('simple-array')
    actions: ('create' | 'read' | 'update' | 'delete')[];
  
    @ManyToOne(() => UserEntity, user => user.permissions, {
        onDelete: 'CASCADE',
        nullable: false,
      })
      user: UserEntity;
  }
  