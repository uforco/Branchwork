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
import { User } from '../auth/guard/user.decorator';
import { Permissions } from '../auth/guard/roles.decorator';
import { Permission } from '../auth/guard/role.enum';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Permissions(Permission.BRANCH_CREATE)
  @Post('add-new-branch')
  create(
    @Body() createBranchDto: CreateBranchDto,
    @User('organizationId') organizationId: string,
  ) {
    return this.branchService.create({ ...createBranchDto, organizationId });
  }

  @Permissions(Permission.BRANCH_READ)
  @Get('All')
  findAll(@User('organizationId') organizationId: string) {
    return this.branchService.findAll(organizationId);
  }

  @Permissions(Permission.BRANCH_UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Permissions(Permission.BRANCH_DELETE)
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}
