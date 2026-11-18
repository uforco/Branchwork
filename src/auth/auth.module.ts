import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EncryptedPasswordModule } from '../lib/encrypted-password/encrypted-password.module';
import { RbacPermissionCacheModule } from '../lib/rbac-permission-cache/rbac-permission-cache.module';

@Module({
  imports: [EncryptedPasswordModule, RbacPermissionCacheModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
