import { Module } from '@nestjs/common';
import { FamiliesService } from './service/families.service';
import { FamiliesController } from './controller/families.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductFamily } from './entity/product-family.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFamily])],
  controllers: [FamiliesController],
  providers: [FamiliesService]
})
export class FamiliesModule {}
