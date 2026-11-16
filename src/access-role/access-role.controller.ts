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

@Controller('access-role')
export class AccessRoleController {
  constructor(private readonly accessRoleService: AccessRoleService) {}

  @Post('add')
  create(@Body() createAccessRoleDto: CreateAccessRoleDto) {
    return this.accessRoleService.create(createAccessRoleDto);
  }

  @Get()
  findAll() {
    return this.accessRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessRoleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccessRoleDto: UpdateAccessRoleDto,
  ) {
    return this.accessRoleService.update(+id, updateAccessRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessRoleService.remove(+id);
  }
}
