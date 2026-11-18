import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindProductQueryDto {
  @ApiPropertyOptional({ example: 'iPhone' })
  @IsOptional()
  @IsString()
  product_name?: string;

  @ApiPropertyOptional({ example: 'IPHONE-16' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  categury?: string;
}

export class ProductId {
  @ApiPropertyOptional({ required: true, type: String, example: 'uuid' })
  @IsNotEmpty()
  @IsString()
  id!: string;
}
