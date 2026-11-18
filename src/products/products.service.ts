import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';
import { AuthUser } from '../auth/guard/user.decorator';
import { RootRole } from '../auth/guard/role.enum';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(private readonly db: DbPrismaService) {}

  async create(createProductDto: CreateProductDto, user: AuthUser) {
    try {
      const result = await this.db.products.create({
        data: {
          ...createProductDto,
          organizationId: user.organizationId,
        },
      });
    } catch (error) {
      this.logger.error('Error in create product', error);
      throw new InternalServerErrorException();
    }
    return 'This action adds a new product';
  }
  async getSeleteBranch(user: AuthUser) {
    try {
      const Query = {};
      if ((user.userRole.role.name as RootRole) !== RootRole.OWNER) {
        Query['id'] = user.branch_id;
      }
      Query['organizationId'] = user.organizationId;
      return await this.db.branches.findMany({
        where: Query,
        select: { id: true, branch_name: true, city: true },
      });
    } catch (error) {
      this.logger.error('Error in getSeleteBranch', error);
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
