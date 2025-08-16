import { Module } from '@nestjs/common';
import { AuthConfig } from './auth.config';

@Module({
  providers: [AuthConfig],
  exports: [AuthConfig],
})
export class AuthModule {}

