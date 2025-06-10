import { Module } from '@nestjs/common';
import { SettingsService } from './service/settings.service';
import { SettingsController } from './controller/settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSetting } from './entity/product-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
