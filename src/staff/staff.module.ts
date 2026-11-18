import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AccessRoleModule } from '../access-role/access-role.module';

@Module({
  imports: [AccessRoleModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
