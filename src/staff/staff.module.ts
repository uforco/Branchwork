import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AccessRoleModule } from '../access-role/access-role.module';
import { EncryptedPasswordModule } from '../lib/encrypted-password/encrypted-password.module';

@Module({
  imports: [AccessRoleModule, EncryptedPasswordModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
