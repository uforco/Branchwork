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
import { FindProductQueryDto } from './dto/find-product-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(private readonly db: DbPrismaService) {}

  // Create New Product
  createProduct(createProductDto: CreateProductDto, user: AuthUser) {
    try {
      return this.db.products.create({
        data: { ...createProductDto, organizationId: user.organizationId },
      });
    } catch (error) {
      this.logger.error('Error in create product', error);
      throw new InternalServerErrorException();
    }
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
  /* this End area create proction Functions */

  // Find All Procust - main api Fuction
  async findAll(query: FindProductQueryDto, user: AuthUser) {
    console.log(user);
    const filter = this.filterProductQuery(query);
    try {
      const Query = {};
      if ((user.userRole.role.name as RootRole) !== RootRole.OWNER) {
        Query['branchId'] = user.branch_id;
      }
      Query['organizationId'] = user.organizationId;
      return await this.db.products.findMany({
        where: {
          ...Query,
          ...filter,
        },
      });
    } catch (err) {
      this.logger.error('Error in find all branch', err);
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.db.products.update({
        where: { id },
        data: updateProductDto,
      });
      return product;
    } catch (error) {
      this.logger.error('Error in update product', error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      await this.db.products.delete({ where: { id } });
      return {
        status: true,
        massage: 'Product Remove SuccessFully',
      };
    } catch (error) {
      this.logger.error('Error in delete product', error);
      throw new InternalServerErrorException();
    }
  }

  // Inner Privete Function Area
  private filterProductQuery(query: FindProductQueryDto) {
    const { product_name, sku, categury } = query;
    const Query = {};
    if (product_name) {
      Query['product_name'] = {
        contains: product_name,
        mode: 'insensitive',
      };
    }
    if (sku) {
      Query['sku'] = {
        contains: sku,
        mode: 'insensitive',
      };
    }
    if (categury) {
      Query['categury'] = {
        contains: categury,
        mode: 'insensitive',
      };
    }
    return Query;
  }
}
