import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccessRoleService } from './access-role.service';
import { CreateAccessRoleDto } from './dto/create-access-role.dto';
import { UpdateAccessRoleDto } from './dto/update-access-role.dto';
import { User } from '../auth/guard/user.decorator';
import type { AuthUser } from '../auth/guard/user.decorator';
import { Permissions } from '../auth/guard/roles.decorator';
import { Permission } from '../auth/guard/role.enum';

@Controller('access-role')
export class AccessRoleController {
  constructor(private readonly accessRoleService: AccessRoleService) {}

  // Create a new role with permissions
  // Permission required: ROLE_CREATE
  // this 2 Func Api only create Role and add-role with Owner Organiztion
  @Permissions(Permission.ROLE_CREATE)
  @Post('add-role')
  create(
    @Body() createAccessRoleDto: CreateAccessRoleDto,
    @User() user: AuthUser,
  ) {
    return this.accessRoleService.create(createAccessRoleDto, user);
  }
  @Permissions(Permission.PERMISSION_READ)
  @Get('permission-list')
  getPermissionList(@User() user: AuthUser) {
    return this.accessRoleService.getPermissionList(user);
  }
  /* Create api Function End Area */

  // Read all roles

  // Get All Role And Permisstion
  @Permissions(Permission.ROLE_READ)
  @Get('all-role-permission')
  getAllRolesWithPermissions(@User() user: AuthUser) {
    return this.accessRoleService.getAllRolesWithPermissions(user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.accessRoleService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccessRoleDto: UpdateAccessRoleDto,
  ) {
    return this.accessRoleService.update(id, updateAccessRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessRoleService.remove(+id);
  }
}
