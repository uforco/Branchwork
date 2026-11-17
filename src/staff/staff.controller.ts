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

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('Add-new-staff')
  create(@Body() createStaffDto: CreateStaffDto, @User() user: AuthUser) {
    return this.staffService.create(createStaffDto, user);
  }

  @Get()
  findAll(@User() user: AuthUser) {
    return this.staffService.findAll(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @User() user: AuthUser,
  ) {
    return this.staffService.update(id, updateStaffDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
