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
            organizationId: user.organizationId,
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

  async getAllRolesWithPermissions(user: AuthUser) {
    const data = this.db.role.findMany({
      where: {
        organizationId: user.organizationId,
        // rolePermission: {
        //   permission: {
        //     key: {
        //       notIn: [Permission.OWNER_ALL],
        //     },
        //   },
        // },
      },
      select: {
        id: true,
        name: true,
        description: true,
        rolePermission: {
          select: {
            permission: {
              select: {
                id: true,
                description: true,
              },
            },
          },
        },
      },
    });
    return data;
  }

  async findOne(id: string) {
    const data = await this.db.role.findMany({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        rolePermission: {
          select: {
            permission: {
              select: {
                id: true,
                description: true,
              },
            },
          },
        },
      },
    });
    return data;
  }

  async update(id: string, updateAccessRoleDto: UpdateAccessRoleDto) {
    const { permission, ...rest } = updateAccessRoleDto;
    try {
      await this.db.$transaction(async (tx) => {
        const role = await tx.role.update({
          where: { id },
          data: {
            ...rest,
          },
        });
        if (permission && permission.length > 0) {
          console.log(permission);
          await tx.rolePermission.deleteMany({
            where: {
              roleId: role.id,
            },
          });

          await tx.rolePermission.createMany({
            data: permission.map((item) => ({
              roleId: role.id,
              permissionId: item.permissionId,
            })),
          });
        }
        return role;
      });

      return { message: 'updated success', data: await this.findOne(id) };
    } catch (err) {
      this.logger.debug('error caught in create access role service: ', err);
      throw new InternalServerErrorException();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} accessRole`;
  }
}
