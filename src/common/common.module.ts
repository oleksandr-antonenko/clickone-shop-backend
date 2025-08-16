import { Module } from '@nestjs/common';
import { RequireCustomerGuard } from './guards/require-customer.guard';

@Module({
  providers: [RequireCustomerGuard],
  exports: [RequireCustomerGuard],
})
export class CommonModule {}

