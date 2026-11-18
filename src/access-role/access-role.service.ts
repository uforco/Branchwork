import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateAccessRoleDto } from './dto/create-access-role.dto';
import { UpdateAccessRoleDto } from './dto/update-access-role.dto';
import { AuthUser } from '../auth/guard/user.decorator';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';
import { Permission, RootRole } from '../auth/guard/role.enum';

@Injectable()
export class AccessRoleService {
  private readonly logger = new Logger(AccessRoleService.name);
  constructor(private readonly db: DbPrismaService) {}

  // this 2 Func Api only create Role and add-role with Owner Organiztion
  async create(createAccessRoleDto: CreateAccessRoleDto, user: AuthUser) {
    try {
      const { permission, ...rest } = createAccessRoleDto;
      const newRole = await this.db.$transaction(async (tx) => {
        const createRole = await tx.role.create({
          data: {
            ...rest,
            userId: user.id,
          },
        });
        await tx.rolePermission.createMany({
          data: permission.map((item) => ({
            roleId: createRole.id,
            permissionId: item.permissionId,
          })),
        });
        return createRole;
      });
      return newRole;
    } catch (err) {
      this.logger.debug('error caught in create access role service: ', err);
      throw new InternalServerErrorException();
    }
  }
  async getPermissionList(user: AuthUser) {
    const Query = {};
    if ((user.userRole.role.name as RootRole) !== RootRole.OWNER) {
      Query['key'] = {
        notIn: [Permission.OWNER_ALL],
      };
    }
    const data = await this.db.permission.findMany({
      where: Query,
      select: {
        id: true,
        key: true,
        description: true,
      },
    });
    return data;
  }
  /* Create Role Function End Area */


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
