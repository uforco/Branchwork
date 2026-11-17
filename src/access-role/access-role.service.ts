import { Injectable } from '@nestjs/common';
import { CreateAccessRoleDto } from './dto/create-access-role.dto';
import { UpdateAccessRoleDto } from './dto/update-access-role.dto';
import { AuthUser } from '../auth/guard/user.decorator';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';

@Injectable()
export class AccessRoleService {
  constructor(private readonly db: DbPrismaService) {}

  create(createAccessRoleDto: CreateAccessRoleDto) {
    return 'This action adds a new accessRole';
  }

  async findAll(user: AuthUser) {
    // const result = await this.db.user.groupBy({
    //   by: ['role'],
    //   where: {
    //     role: {
    //       notIn: [user.role],
    //     },
    //     organizationId: user.organizationId,
    //   },

    // });
    // return result;
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
