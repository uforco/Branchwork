import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Roles } from '../auth/guard/roles.decorator';
import { Role } from '../auth/guard/role.enum';
import { User } from '../auth/guard/user.decorator';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Roles(Role.Owner)
  @Post('add-new-branch')
  create(
    @Body() createBranchDto: CreateBranchDto,
    @User('organizationId') organizationId: string,
  ) {
    return this.branchService.create({ ...createBranchDto, organizationId });
  }

  @Roles(Role.Owner)
  @Get('All')
  findAll(@User('organizationId') organizationId: string) {
    return this.branchService.findAll(organizationId);
  }

  @Roles(Role.Owner)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Roles(Role.Owner)
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    console.log(id);
    return this.branchService.remove(id);
  }
}
