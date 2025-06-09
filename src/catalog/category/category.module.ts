import {Module} from '@nestjs/common';
import {CategoryController} from './controller/category.controller';
import {CategoryService} from './service/category.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Category} from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
