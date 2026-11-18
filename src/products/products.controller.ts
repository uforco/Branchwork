import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Permissions } from '../auth/guard/roles.decorator';
import { Permission } from '../auth/guard/role.enum';
import type { AuthUser } from '../auth/guard/user.decorator';
import { User } from '../auth/guard/user.decorator';
import { FindProductQueryDto } from './dto/find-product-query.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Permissions(Permission.PRODUCT_CREATE)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @User() user: AuthUser) {
    return this.productsService.createProduct(createProductDto, user);
  }
  @Permissions(Permission.PRODUCT_CREATE)
  @Get('create-product-selete-branch')
  getSeleteBranch(@User() user: AuthUser) {
    return this.productsService.getSeleteBranch(user);
  }

  // find all product with filter
  @Permissions(Permission.PRODUCT_READ)
  @Get()
  @ApiOperation({ summary: 'Find products by filters' })
  @ApiQuery({ name: 'product_name', required: false })
  @ApiQuery({ name: 'sku', required: false })
  @ApiQuery({ name: 'categury', required: false })
  findAll(@Query() query: FindProductQueryDto, @User() user: AuthUser) {
    return this.productsService.findAll(query, user);
  }

  @Permissions(Permission.PRODUCT_UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Permissions(Permission.PRODUCT_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
