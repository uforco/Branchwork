import { Module } from '@nestjs/common';
import { RbacPermissionCacheService } from './rbac-permission-cache.service';

@Module({
  providers: [RbacPermissionCacheService],
  exports: [RbacPermissionCacheService],
})
export class RbacPermissionCacheModule {}
