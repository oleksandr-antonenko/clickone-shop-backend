import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';

import { BrandController } from './controler/brand.controller';
import { Brand } from './entities/brand.entity';
import { BrandService } from './service/brand.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), FilterModule, PaginationModule],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
