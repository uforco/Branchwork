import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBranchDtoData } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  constructor(private readonly db: DbPrismaService) {}

  async create(createBranchDto: CreateBranchDtoData) {
    try {
      // isExist branch
      const isExist = await this.db.branches.findFirst({
        where: {
          AND: [
            { branch_name: createBranchDto.branch_name },
            { organizationId: createBranchDto.organizationId },
            { city: createBranchDto.city },
          ],
        },
      });
      if (isExist)
        throw new ConflictException(
          'This branch is already exist! this Organization',
        );

      const createBranch = await this.db.branches.create({
        data: {
          branch_name: createBranchDto.branch_name,
          city: createBranchDto.city,
          organizationId: createBranchDto.organizationId,
        },
      });
      return {
        message: 'Branch created successfully!',
        data: createBranch,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        'status' in error &&
        error['status'] === 409
      ) {
        throw error;
      }
      if (
        error instanceof Error &&
        'code' in error &&
        error['code'] === 'P2002'
      ) {
        throw new ConflictException('Branch already exist');
      }
      // Unexceptad Error
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  // find all branch by organization id
  async findAll(organizationId: string) {
    try {
      const findBranch = await this.db.branches.findMany({
        where: {
          organizationId: organizationId,
        },
        include: {
          _count: {
            select: {
              user: true,
            },
          },
        },
      });
      return {
        message: 'All branches fetch successfully!',
        data: findBranch.map(({ _count, ...branch }) => ({
          ...branch,
          staff: _count.user,
        })),
      };
    } catch (err) {
      this.logger.debug(err);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const isExist = await this.db.branches.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        branch_name: true,
        city: true,
      },
    });
    if (!isExist) throw new NotFoundException('Branch not found!');
    const updateBranch = await this.db.branches.update({
      where: {
        id: isExist.id,
      },
      data: {
        branch_name: updateBranchDto.branch_name ?? isExist.branch_name,
        city: updateBranchDto.city ?? isExist.city,
      },
    });
    return {
      message: 'Branch updated successfully!',
      data: updateBranch,
    };
  }

  // remove branch by id
  async remove(id: string) {
    try {
      const isBranchExist = await this.db.branches.findUnique({
        where: {
          id: id,
        },
      });
      if (!isBranchExist) throw new NotFoundException('Branch not found!');
      await this.db.branches.delete({
        where: {
          id: id,
        },
      });
      return {
        message: 'Branch deleted successfully!',
      };
    } catch (error) {
      if (
        error instanceof Error &&
        'status' in error &&
        error['status'] === 404
      ) {
        throw error;
      }
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }
}
