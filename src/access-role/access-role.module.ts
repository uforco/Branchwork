import { Module } from '@nestjs/common';
import { AccessRoleService } from './access-role.service';
import { AccessRoleController } from './access-role.controller';

@Module({
  controllers: [AccessRoleController],
  providers: [AccessRoleService],
  exports: [AccessRoleService],
})
export class AccessRoleModule {}
