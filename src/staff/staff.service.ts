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
import { Role } from '../auth/guard/role.enum';
import { AuthUser } from '../auth/guard/user.decorator';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  constructor(private readonly db: DbPrismaService) {}

  // create organization with staff defualt role
  async create(createStaffDto: CreateStaffDto, user: AuthUser) {
    if (user.role === Role.Branch_manager)
      createStaffDto.branch_id = user.branch_id;
    try {
      const isExist = await this.db.user.findUnique({
        where: {
          email: createStaffDto.email,
        },
      });
      if (isExist) throw new ConflictException('Email already exist');
      const newStaff = await this.db.user.create({
        data: {
          ...createStaffDto,
          organizationId: user.organizationId,
        },
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

  findAll(user: AuthUser) {
    const Query = {};
    if (user.role === Role.Owner) {
      Query['id'] = { not: user.id };
      Query['organizationId'] = user.organizationId;
    }
    if (user.role === Role.Branch_manager) {
      Query['branch_id'] = user.branch_id;
      Query['organizationId'] = user.organizationId;
    }

    const getAllStaff = this.db.user.findMany({
      where: Query,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branch: true,
      },
    });

    return getAllStaff;
  }

  async findOne(id: string) {
    try {
      return await this.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
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
  update(id: string, updateStaffDto: UpdateStaffDto, user: AuthUser) {
    if (user.id === id && Role.Branch_manager === user.role)
      throw new ConflictException('You can not update your own role');

    if (user.id !== id && Role.Branch_manager === user.role)
      updateStaffDto.branch_id = user.branch_id;

    try {
      // const update = await this.db.user.update({
      //   where: {
      //     id,
      //     role: {
      //       not: Role.Owner,
      //     },
      //   },
      //   data: { ...updateStaffDto },
      // });
      // return {
      //   success: true,
      //   message: 'Staff updated successfully',
      //   data: update,
      // };
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
