import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminModule } from '~/admin/admin.module';
import { UserModule } from '~/user/user.module';

import { CategoryController } from './controller/category.controller';
import { Category } from './entities/category.entity';
import { CategoryService } from './service/category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AdminModule,
    UserModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
