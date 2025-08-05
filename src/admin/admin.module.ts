import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { AdminEntity } from './entities/admin.entity';
import { PermissionEntity } from './entities/permission.entity';
import { PaginationModule } from '../pagination/pagination.module';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';
import { AdminManagementService } from './service/admin-management.service';
import { PermissionService } from './service/permission.service';
import { PermissionGuard } from './guards/permission.guard';
import { UserService } from '../user/service/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CustomerEntity, AdminEntity, PermissionEntity]),
    PaginationModule
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminManagementService, PermissionService, PermissionGuard, UserService],
  exports: [AdminService, AdminManagementService, PermissionService, PermissionGuard],
})
export class AdminModule {} 