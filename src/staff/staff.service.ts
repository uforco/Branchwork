import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';
import { AuthUser } from '../auth/guard/user.decorator';
import { AccessRoleService } from '../access-role/access-role.service';
import { Permission, RootRole } from '../auth/guard/role.enum';
import { EncryptedPasswordService } from '../lib/encrypted-password/encrypted-password.service';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  constructor(
    private readonly db: DbPrismaService,
    private readonly accessRoleService: AccessRoleService,
    private readonly encryptedPasswordService: EncryptedPasswordService,
  ) {}

  // create organization with staff defualt role
  async create(createStaffDto: CreateStaffDto, user: AuthUser) {
    const { roleId, ...other } = createStaffDto;
    other.password = await this.encryptedPasswordService.getHash(
      other.password,
    );
    try {
      const isExist = await this.db.user.findUnique({
        where: {
          email: createStaffDto.email,
        },
      });
      if (isExist) throw new ConflictException('Email already exist');
      const newStaff = await this.db.$transaction(async (tx) => {
        const createStaff = await tx.user.create({
          data: {
            ...other,
            organizationId: user.organizationId,
          },
        });
        const createUserRole = await tx.userRole.create({
          data: {
            userId: createStaff.id,
            roleId: roleId,
          },
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        });
        return { ...createStaff, userRole: createUserRole };
      });
      return {
        success: true,
        message: 'Staff created successfully',
        data: newStaff,
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 409)
        throw error;

      if (error instanceof Error && 'code' in error && error.code === 'P2002')
        throw new ConflictException('Email already taken');

      this.logger.debug('Staff API - ', error);
      throw new InternalServerErrorException(
        ' Something went wrong!!! Please contact support team ',
      );
    }
  }
  async seleteStaffRole(user: AuthUser) {
    return await this.accessRoleService.getAllRolesWithPermissions(user);
  }
  /* create staff 2 fuction end area */

  // get all staff with filter option
  findAll(user: AuthUser) {
    try {
      const Query = {};
      if ((user.userRole.role.name as RootRole) !== RootRole.OWNER) {
        // Query['id'] = { not: user.id }; // without login user data
        Query['branch_id'] = user.branch_id;
      }
      Query['organizationId'] = user.organizationId;

      const getAllStaff = this.db.user.findMany({
        where: Query,
        select: {
          id: true,
          name: true,
          email: true,
          branch: true,
          userRole: {
            select: {
              role: {
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
              },
            },
          },
        },
      });
      return getAllStaff;
    } catch (err) {
      this.logger.debug('Staff API - ', err);
      throw new InternalServerErrorException(
        ' Something went wrong!!! Please contact support team ',
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          userRole: {
            select: {
              role: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.debug('Staff API - ', error);
      throw new InternalServerErrorException(
        ' Something went wrong!!! Please contact support team ',
      );
    }
  }

  // this func for update staff by id
  async update(id: string, updateStaffDto: UpdateStaffDto, user: AuthUser) {
    if (user.id === id)
      throw new ConflictException('You can not update your own role');
    const { roleId, ...rest } = updateStaffDto;
    if (rest.password) {
      rest.password = await this.encryptedPasswordService.getHash(
        rest.password,
      );
    }
    try {
      const updateStaffProfile = await this.db.$transaction(async (tx) => {
        const updateUser = await tx.user.update({
          where: {
            id,
            userRole: {
              role: {
                rolePermission: {
                  some: {
                    permission: {
                      key: {
                        notIn: [Permission.OWNER_ALL],
                      },
                    },
                  },
                },
              },
            },
          },
          data: { ...rest },
        });
        // update userRole
        const userRole = await this.db.userRole.update({
          where: {
            userId: updateUser.id,
          },
          data: {
            roleId,
          },
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        });
        return { ...updateUser, userRole };
      });
      return {
        success: true,
        message: 'Staff updated successfully',
        data: updateStaffProfile,
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025')
        throw new NotFoundException('Staff not found');
      this.logger.debug('Staff update API - ', error);
      throw new InternalServerErrorException(
        ' Something went wrong!!! Please contact support team ',
      );
    }
  }

  // this func for delete staff by id
  async remove(id: string) {
    const isExist = await this.findOne(id);
    if (!isExist) throw new NotFoundException('Staff not found');
    try {
      await this.db.userRole.delete({ where: { userId: id } });
      await this.db.user.delete({ where: { id } });
      return { success: true, message: 'Staff removed successfully' };
    } catch (error) {
      this.logger.debug('Staff API - ', error);
      throw new InternalServerErrorException(
        ' Something went wrong!!! Please contact support team ',
      );
    }
  }
}
