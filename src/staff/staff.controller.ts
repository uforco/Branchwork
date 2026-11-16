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
import { Roles } from '../auth/guard/roles.decorator';
import { Role } from '../auth/guard/role.enum';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles(Role.Owner)
  @Post('Add-new-staff')
  create(
    @Body() createStaffDto: CreateStaffDto,
    @User('organizationId') organizationId: string,
  ) {
    return this.staffService.create(createStaffDto, organizationId);
  }

  @Roles(Role.Owner, Role.Branch_manager)
  @Get()
  findAll(@User() user: AuthUser) {
    return this.staffService.findAll(user);
  }

  @Roles(Role.Owner)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @User() user: AuthUser,
  ) {
    return this.staffService.update(id, updateStaffDto, user);
  }

  @Roles(Role.Owner)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
