import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EncryptedPasswordModule } from '../lib/encrypted-password/encrypted-password.module';

@Module({
  imports: [EncryptedPasswordModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
