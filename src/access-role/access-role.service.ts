import { Injectable } from '@nestjs/common';
import { CreateAccessRoleDto } from './dto/create-access-role.dto';
import { UpdateAccessRoleDto } from './dto/update-access-role.dto';

@Injectable()
export class AccessRoleService {
  create(createAccessRoleDto: CreateAccessRoleDto) {
    return 'This action adds a new accessRole';
  }

  findAll() {
    return `This action returns all accessRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accessRole`;
  }

  update(id: number, updateAccessRoleDto: UpdateAccessRoleDto) {
    return `This action updates a #${id} accessRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} accessRole`;
  }
}
