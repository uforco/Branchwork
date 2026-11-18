import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import type { AuthUser } from '../auth/guard/user.decorator';
import { User } from '../auth/guard/user.decorator';
import { Permissions } from '../auth/guard/roles.decorator';
import { Permission } from '../auth/guard/role.enum';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Permissions(Permission.USER_CREATE)
  @Post('Add-new-staff')
  create(@Body() createStaffDto: CreateStaffDto, @User() user: AuthUser) {
    return this.staffService.create(createStaffDto, user);
  }
  @Permissions(Permission.USER_CREATE)
  @Get('selete-new-staff-role')
  seleteStaffRole(@User() user: AuthUser) {
    return this.staffService.seleteStaffRole(user);
  }

  @Permissions(Permission.USER_READ)
  @Get()
  findAll(@User() user: AuthUser) {
    return this.staffService.findAll(user);
  }

  @Permissions(Permission.USER_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @User() user: AuthUser,
  ) {
    return this.staffService.update(id, updateStaffDto, user);
  }

  @Permissions(Permission.USER_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
