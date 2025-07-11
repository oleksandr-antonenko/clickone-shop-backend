import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, AuthService],
  exports: [JwtStrategy, AuthService],
})
export class AuthModule {} 