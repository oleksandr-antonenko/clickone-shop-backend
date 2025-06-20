import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamiliesController } from './controller/families.controller';
import { ProductFamily } from './entity/product-family.entity';
import { FamiliesService } from './service/families.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFamily])],
  controllers: [FamiliesController],
  providers: [FamiliesService],
})
export class FamiliesModule {}
