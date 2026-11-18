import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    required: false,
    type: String,
    example: 'iPhone 16 Pro',
    description: 'Product name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  product_name?: string;

  @ApiProperty({
    required: false,
    type: String,
    example: 'IPHONE-16-PRO',
    description: 'Unique product SKU',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({
    required: false,
    type: String,
    example: 'Electronics',
    description: 'Product category',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  categury?: string;

  @ApiProperty({
    required: false,
    type: Number,
    example: 999.99,
    description: 'Product price (must be non-negative)',
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiProperty({
    required: false,
    type: Number,
    example: 100,
    description: 'Available product stock (must be non-negative)',
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stock?: number;
}
